
import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Database, Activity, Server, FileJson, FileText, Sparkles, Brain } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { Button } from './ui/Button';
import { SIGNUP_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

// --- 3D Background Components ---

const FloatingGlass = ({
  mouseX,
  mouseY,
  depth,
  className,
  children
}: {
  mouseX: MotionValue;
  mouseY: MotionValue;
  depth: number;
  className?: string;
  children?: React.ReactNode;
}) => {
  const x = useTransform(mouseX, [-0.5, 0.5], [-depth, depth]);
  const y = useTransform(mouseY, [-0.5, 0.5], [-depth, depth]);

  return (
    <motion.div
      style={{ x, y, rotateX: useTransform(mouseY, [-0.5, 0.5], [10, -10]), rotateY: useTransform(mouseX, [-0.5, 0.5], [-10, 10]) }}
      className={`absolute ${className} backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center`}
    >
      {children}
    </motion.div>
  );
};

const InteractiveBackground = ({ mouseX, mouseY }: { mouseX: MotionValue, mouseY: MotionValue }) => {
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-1000 flex items-center justify-center">
      {/* Deep Atmosphere Glow */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] bg-neon-400/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />

      {/* The 3D Construct */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-4xl h-[600px] hidden md:block" // Hidden on mobile to save performance/space
      >
        {/* Layer 1: Back Grid Plane (Farthest) */}
        <FloatingGlass mouseX={mouseX} mouseY={mouseY} depth={40} className="top-[10%] left-[15%] w-64 h-64 rounded-[2rem] bg-slate-900/40 z-0 opacity-40 -rotate-12">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] rounded-[2rem]"></div>
        </FloatingGlass>

        {/* Layer 2: Main Emerald Core (Middle) */}
        <FloatingGlass mouseX={mouseX} mouseY={mouseY} depth={20} className="top-[25%] left-[50%] -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-neon-400/5 to-teal-500/10 z-10 blur-3xl" />

        {/* Layer 3: The Central Glass Prism */}
        <FloatingGlass mouseX={mouseX} mouseY={mouseY} depth={-20} className="top-[30%] left-[50%] -translate-x-1/2 w-72 h-72 rounded-[3rem] bg-white/5 border-white/20 z-20 rotate-45">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem]"></div>
          <Activity size={64} className="text-neon-400 opacity-80 drop-shadow-[0_0_15px_rgba(0,255,163,0.5)]" />
        </FloatingGlass>

        {/* Layer 4: Floating Data Chips (Closest) */}
        <FloatingGlass mouseX={mouseX} mouseY={mouseY} depth={-60} className="top-[20%] right-[25%] w-20 h-20 rounded-2xl bg-slate-800/60 border-neon-400/30 z-30 rotate-12">
          <FileText size={24} className="text-white opacity-60" />
        </FloatingGlass>

        <FloatingGlass mouseX={mouseX} mouseY={mouseY} depth={-50} className="bottom-[30%] left-[25%] w-24 h-24 rounded-2xl bg-slate-800/60 border-cyan-400/30 z-30 -rotate-12">
          <Brain size={32} className="text-cyan-400 opacity-80" />
        </FloatingGlass>

        <FloatingGlass mouseX={mouseX} mouseY={mouseY} depth={-80} className="bottom-[20%] right-[35%] w-16 h-16 rounded-xl bg-slate-800/60 border-purple-400/30 z-30 rotate-6">
          <Sparkles size={20} className="text-purple-400 opacity-80" />
        </FloatingGlass>
      </motion.div>
    </div>
  );
};

// --- Existing Components ---

// Fix: Make children optional in the props type to resolve linter errors when used in JSX
const Hero3DCard = ({ children, delay = 0, className = "" }: { children?: React.ReactNode, delay?: number, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1200
      }}
      className={`relative h-full ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="h-full w-full"
      >
        <div className="relative h-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-neon-400/40 transition-colors duration-500">

          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-400/20 blur-[60px] rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-500" />

          <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const KineticText = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  const words = text.split(" ");
  return (
    <span className={`inline-block align-bottom leading-[1.1] pb-2 ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-2 md:mr-4 pb-1">
          <motion.span
            initial={{ y: "110%", opacity: 0, rotateZ: 5 }}
            animate={{ y: 0, opacity: 1, rotateZ: 0 }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="inline-block origin-top-left will-change-transform"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  // Physics-based Mouse Movement Logic for Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // High stiffness/damping for "Apple-like" weighted feel
  const springConfig = { damping: 40, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / innerWidth;
      const y = (clientY - innerHeight / 2) / innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[70vh] flex flex-col justify-center pt-12 md:pt-20 pb-4 overflow-hidden perspective-1000">

      {/* 3D Interactive Background */}
      <InteractiveBackground mouseX={smoothX} mouseY={smoothY} />

      {/* Content Layer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md text-neon-400 text-[10px] md:text-xs font-mono uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-default hover:scale-105 transform duration-300 shadow-[0_0_30px_rgba(0,255,163,0.1)]">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neon-400 animate-pulse shadow-[0_0_10px_#00FFA3]"></span>
            {t.hero.newBadge}
          </div>
        </motion.div>

        {/* Kinetic Headline */}
        <div className="relative z-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-4 md:mb-6 drop-shadow-2xl mix-blend-overlay md:mix-blend-normal">
            <div className="block">
              <KineticText text={t.hero.headline} delay={0.2} />
            </div>
            <div className="block mt-[-5px] md:mt-[-20px]">
              <span className="inline-block overflow-hidden align-bottom pb-4">
                <motion.span
                  initial={{ y: "110%", opacity: 0, rotateZ: 3 }}
                  animate={{ y: 0, opacity: 1, rotateZ: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block bg-gradient-to-r from-neon-400 via-emerald-200 to-cyan-400 text-gradient leading-[1.1] origin-bottom-left"
                >
                  {t.hero.headlineHighlight}
                </motion.span>
              </span>
            </div>
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          className="text-base md:text-lg text-slate-200 mb-4 md:mb-6 leading-relaxed max-w-2xl mx-auto font-light drop-shadow-md relative z-20 bg-slate-950/30 backdrop-blur-sm rounded-xl p-4 md:p-0 md:bg-transparent"
        >
          {t.hero.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 relative z-20"
        >
          <Button href={SIGNUP_URL} size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 text-lg shadow-[0_0_40px_rgba(0,255,163,0.3)] hover:shadow-[0_0_60px_rgba(0,255,163,0.6)] transition-all duration-500 hover:-translate-y-1 bg-neon-400 text-slate-950 font-bold border-none">
            {t.hero.cta}
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <CheckCircle2 size={16} className="text-neon-400" />
            <span>{t.hero.noCard}</span>
          </div>
        </motion.div>

        {/* 3D Glass Cards Section - Enhanced Floating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-24 mb-16 max-w-6xl mx-auto relative z-20 px-2 md:px-0">

          <Hero3DCard delay={1.2} className="w-full">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">2h+</div>
            <div className="h-1.5 w-16 bg-neon-400 rounded-full mb-4 shadow-[0_0_15px_#00FFA3]"></div>
            <div className="text-slate-300 text-sm font-mono uppercase tracking-wider">Time Saved Daily</div>
            <p className="text-xs text-slate-400 mt-2 opacity-80">Automated documentation & charting</p>
          </Hero3DCard>

          <Hero3DCard delay={1.3} className="w-full">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">100%</div>
            <div className="h-1.5 w-16 bg-cyan-400 rounded-full mb-4 shadow-[0_0_15px_#22d3ee]"></div>
            <div className="text-slate-300 text-sm font-mono uppercase tracking-wider">{t.hero.stats.residency}</div>
            <p className="text-xs text-slate-400 mt-2 opacity-80">GCP Montreal Region & Law 25 Compliant</p>
          </Hero3DCard>

          <Hero3DCard delay={1.4} className="w-full">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">15+</div>
            <div className="h-1.5 w-16 bg-purple-400 rounded-full mb-4 shadow-[0_0_15px_#c084fc]"></div>
            <div className="text-slate-300 text-sm font-mono uppercase tracking-wider">{t.hero.stats.specialties}</div>
            <p className="text-xs text-slate-400 mt-2 opacity-80">From Cardiology to Psychiatry</p>
          </Hero3DCard>

        </div>

        {/* Compatibility Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="border-t border-white/5 pt-10 relative z-20"
        >
          <p className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-6">Compatible with your ecosystem</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-16 opacity-70">
            <div className="flex items-center gap-2 group cursor-default">
              <Activity className="text-slate-600 group-hover:text-blue-400 transition-colors" />
              <span className="text-base md:text-lg font-bold text-slate-500 group-hover:text-white transition-colors">Omnimed</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Database className="text-slate-600 group-hover:text-purple-400 transition-colors" />
              <span className="text-base md:text-lg font-bold text-slate-500 group-hover:text-white transition-colors">TELUS Health</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Server className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
              <span className="text-base md:text-lg font-bold text-slate-500 group-hover:text-white transition-colors">MYLE</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <FileJson className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
              <span className="text-base md:text-lg font-bold text-slate-500 group-hover:text-white transition-colors">RAMQ</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
