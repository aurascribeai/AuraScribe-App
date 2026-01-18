import { useRef, useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface TranscriptionState {
  transcript: string;
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
  confidence: number;
  wordCount: number;
}

interface UseRealtimeTranscriptionOptions {
  language?: string;
  model?: string;
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useRealtimeTranscription(options: UseRealtimeTranscriptionOptions = {}) {
  const {
    language = 'fr-CA',
    model = 'nova-3',
    onTranscriptUpdate,
    onError
  } = options;

  const [state, setState] = useState<TranscriptionState>({
    transcript: '',
    isConnected: false,
    isRecording: false,
    error: null,
    confidence: 0,
    wordCount: 0
  });

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Connect to backend WebSocket using env var
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const wsUrl = import.meta.env.VITE_WS_URL || backendUrl;

    console.log('Connecting to WebSocket:', wsUrl);

    const socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('status', (data) => {
      console.log('WebSocket status:', data);
    });

    socket.on('recording_started', (data) => {
      console.log('Recording started:', data);
      setState(prev => ({ ...prev, isRecording: true }));
    });

    socket.on('transcript_update', (data) => {
      console.log('Transcript update:', data);
      setState(prev => ({
        ...prev,
        transcript: data.transcript || prev.transcript,
        confidence: data.confidence || prev.confidence,
        wordCount: data.word_count || prev.wordCount
      }));
      onTranscriptUpdate?.(data.transcript, data.is_final);
    });

    socket.on('chunk_received', (data) => {
      // Chunk acknowledged, keep recording
      console.debug('Chunk received:', data.chunk_number);
    });

    socket.on('recording_stopped', (data) => {
      console.log('Recording stopped:', data);
      setState(prev => ({
        ...prev,
        isRecording: false,
        transcript: data.final_transcript || prev.transcript,
        confidence: data.confidence || prev.confidence,
        wordCount: data.word_count || prev.wordCount
      }));
      onTranscriptUpdate?.(data.final_transcript, true);
    });

    socket.on('error', (data) => {
      console.error('WebSocket error:', data);
      setState(prev => ({ ...prev, error: data.message }));
      onError?.(data.message);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect to server', isConnected: false }));
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setState(prev => ({ ...prev, isConnected: true, error: null }));
      // Restart recording if it was active before disconnection
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        socket.emit('start_recording', { language, model });
      }
    });

    socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection failed:', error);
      setState(prev => ({ ...prev, error: 'Reconnection failed' }));
    });

    socketRef.current = socket;
  }, [onTranscriptUpdate, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  // Start recording and streaming audio
  const startRecording = useCallback(async () => {
    try {
      // Connect if not already
      if (!socketRef.current?.connected) {
        connect();
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Tell server we're starting
      socketRef.current?.emit('start_recording', { language, model });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Send audio chunks to server
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.connected) {
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            socketRef.current?.emit('audio_chunk', {
              audio: base64,
              language,
              is_final: false
            });
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Start recording with timeslice (send chunks every 250ms for better real-time performance)
      mediaRecorder.start(250);

      setState(prev => ({
        ...prev,
        isRecording: true,
        transcript: '',
        error: null
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [connect, language, model, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Tell server to stop and get final transcript
    socketRef.current?.emit('stop_recording');

    mediaRecorderRef.current = null;
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      confidence: 0,
      wordCount: 0
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      disconnect();
    };
  }, [stopRecording, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearTranscript
  };
}
