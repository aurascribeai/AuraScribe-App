import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_KEY = import.meta.env.VITE_API_KEY;

export interface RealtimeTranscript {
    transcript: string;
    isFinal: boolean;
    confidence?: number;
    wordCount?: number;
    error?: string;
}

export function useRealtimeTranscription({
    backendUrl = 'http://localhost:5000',
    language = 'fr-CA',
    model = 'nova-3',
    onStatus,
}: {
    backendUrl?: string;
    language?: string;
    model?: string;
    onStatus?: (status: any) => void;
}) {
    const [transcript, setTranscript] = useState<RealtimeTranscript>({ transcript: '', isFinal: false });
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const isRecordingRef = useRef(false);
    const onStatusRef = useRef(onStatus);

    // Keep onStatus ref updated
    useEffect(() => {
        onStatusRef.current = onStatus;
    }, [onStatus]);

    useEffect(() => {
        const socket = io(backendUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            ...(API_KEY ? { auth: { api_key: API_KEY } } : {})
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('WebSocket connected');
            setConnected(true);
            setError(null);
            if (onStatusRef.current) onStatusRef.current({ connected: true, message: 'Connected to real-time transcription' });

            // Only emit start_recording if we're supposed to be recording
            if (isRecordingRef.current) {
                socket.emit('start_recording', { language, model });
            }
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setConnected(false);
            if (onStatusRef.current) onStatusRef.current({ connected: false, message: 'Disconnected' });
        });

        socket.on('status', (data) => {
            console.log('WebSocket status:', data);
            if (onStatusRef.current) onStatusRef.current(data);
        });

        socket.on('recording_started', (data) => {
            console.log('Recording started:', data);
            if (onStatusRef.current) onStatusRef.current({ message: 'Recording started', ...data });
        });

        socket.on('transcript_update', (data) => {
            console.log('Transcript update received:', data.transcript?.substring(0, 50));
            setTranscript({
                transcript: data.transcript || '',
                isFinal: !!data.is_final,
                confidence: data.confidence || 0,
                wordCount: data.word_count || 0,
            });
        });

        socket.on('recording_stopped', (data) => {
            console.log('Recording stopped, final transcript:', data.final_transcript?.substring(0, 50));
            if (data.final_transcript) {
                setTranscript({
                    transcript: data.final_transcript,
                    isFinal: true,
                    confidence: data.confidence || 0,
                    wordCount: data.word_count || 0,
                });
            }
            if (onStatusRef.current) onStatusRef.current({ message: 'Recording stopped', ...data });
        });

        socket.on('chunk_received', (data) => {
            // Acknowledge chunk received - can be used for debugging
            console.log('Chunk received:', data.chunk_number);
        });

        socket.on('error', (err) => {
            console.error('WebSocket error:', err);
            setError(err.message || 'WebSocket error');
            setTranscript(t => ({ ...t, error: err.message || 'WebSocket error' }));
        });

        // Initialize recording on mount
        isRecordingRef.current = true;
        if (socket.connected) {
            socket.emit('start_recording', { language, model });
        }

        return () => {
            isRecordingRef.current = false;
            socket.disconnect();
        };
    }, [backendUrl, language, model]);

    // Function to send audio chunk
    const sendAudioChunk = useCallback((audioBase64: string, isFinal = false) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('audio_chunk', {
                audio: audioBase64,
                language,
                is_final: isFinal,
            });
        } else {
            console.warn('Cannot send audio chunk: socket not connected');
        }
    }, [language]);

    // Function to stop recording
    const stopRecording = useCallback(() => {
        isRecordingRef.current = false;
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('stop_recording');
        }
    }, []);

    // Function to start recording (can be called to restart)
    const startRecording = useCallback(() => {
        isRecordingRef.current = true;
        setTranscript({ transcript: '', isFinal: false });
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('start_recording', { language, model });
        }
    }, [language, model]);

    return {
        transcript,
        connected,
        error,
        sendAudioChunk,
        stopRecording,
        startRecording,
    };
}
