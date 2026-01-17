
import React, { useState, useEffect } from 'react';
import { Shield, EyeOff, Eye, Lock, Clock, AlertTriangle } from 'lucide-react';

interface SecurityShieldProps {
  onLock: () => void;
  isPrivacyMode: boolean;
  togglePrivacy: () => void;
}

const SecurityShield: React.FC<SecurityShieldProps> = ({ onLock, isPrivacyMode, togglePrivacy }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 min timeout

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          onLock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onLock]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3">
      {/* Session Timer */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-3 rounded-2xl flex items-center gap-3 text-white shadow-2xl">
        <Clock size={16} className={secondsRemaining < 300 ? 'text-rose-500 animate-pulse' : 'text-blue-400'} />
        <span className="text-[10px] font-mono font-bold">{formatTime(secondsRemaining)}</span>
      </div>

      {/* Privacy Toggle */}
      <button 
        onClick={togglePrivacy}
        className={`p-4 rounded-2xl border transition-all shadow-2xl flex items-center gap-3 ${
          isPrivacyMode 
          ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:scale-105'
        }`}
      >
        {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
          {isPrivacyMode ? 'Privacy Active' : 'Privacy Mode'}
        </span>
      </button>

      {/* Quick Lock */}
      <button 
        onClick={onLock}
        className="p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl hover:bg-black transition-all shadow-2xl"
        title="Lock Session"
      >
        <Lock size={20} />
      </button>
    </div>
  );
};

export default SecurityShield;
