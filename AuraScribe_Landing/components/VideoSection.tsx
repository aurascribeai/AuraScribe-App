import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const VideoSection: React.FC = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  // REPLACE THIS WITH YOUR MARKETING VIDEO YOUTUBE ID
  // Example ID 'dQw4w9WgXcQ' is a placeholder. 
  // Use a real medical demo video ID here.
  const LOCAL_VIDEO_PATH = "/presentation-video.mp4";
  const LOCAL_VIDEO_POSTER = "/video-cover.png";

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <section id="video" className="py-24 bg-slate-950 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-bold mb-6"
          >
            {t.video.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            {t.video.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900 group"
        >
          {/* Neon Glow effect behind the video */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-400/20 to-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          {!isPlaying ? (
            <>
              {/* Play Button Overlay */}
              <div
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10 cursor-pointer group-hover:bg-slate-900/20 transition-all duration-300"
              >
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(0,255,163,0.1)]">
                  <div className="w-16 h-16 rounded-full bg-neon-400 text-slate-950 flex items-center justify-center shadow-lg shadow-neon-400/30 pl-1">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute mt-32 text-white font-bold tracking-widest text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  WATCH PRESENTATION
                </div>
              </div>

              <img
                src={LOCAL_VIDEO_POSTER}
                alt="AuraScribe Presentation Cover"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700"
              />
            </>
          ) : (
            <video
              width="100%"
              height="100%"
              src={LOCAL_VIDEO_PATH}
              controls
              autoPlay
              className="w-full h-full object-cover"
              poster={LOCAL_VIDEO_POSTER}
            >
              Sorry, your browser does not support embedded videos.
            </video>
          )}
        </motion.div>
      </div>
    </section>
  );
};
