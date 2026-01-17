import React from 'react';
import { Home, Search } from 'lucide-react';
import { Button } from './ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 pt-32">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-neon-400/20 blur-3xl rounded-full"></div>
        <h1 className="text-9xl font-bold text-white relative z-10 font-mono tracking-tighter opacity-50">404</h1>
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
      <p className="text-lg text-slate-400 max-w-lg mb-10">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Button variant="primary" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
        <Home className="mr-2 w-4 h-4" /> Return Home
      </Button>
    </div>
  );
};

export default NotFound;
