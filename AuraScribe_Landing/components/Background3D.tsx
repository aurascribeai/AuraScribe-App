import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const GlassShape = ({
  className,
  delay = 0,
  xRange = [0, 0],
  yRange = [0, 0],
  rotateRange = [0, 0],
  scale = 1
}: {
  className?: string,
  delay?: number,
  xRange?: number[],
  yRange?: number[],
  rotateRange?: number[],
  scale?: number
}) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const x = useTransform(scrollYProgress, [0, 1], xRange);
  const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);

  return (
    <motion.div
      style={{ y, x, rotate }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: scale }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
      className={`absolute pointer-events-none z-0 ${className}`}
    >
      {/* 3D Glass Material Simulation */}
      <div className="relative w-full h-full rounded-full overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        {/* Inner Highlight */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
        {/* Color Glow */}
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-neon-400/20 blur-[30px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/20 blur-[30px] rounded-full mix-blend-screen"></div>
      </div>
    </motion.div>
  );
};

export const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Enhanced Deep Space Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-900/30 via-cyan-400/10 to-purple-900/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-teal-900/20 via-neon-400/10 to-blue-900/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }}></div>

      {/* Floating Glass Shapes with more glow */}
      <GlassShape
        className="top-[10%] right-[5%] w-64 h-64 md:w-96 md:h-96 opacity-70 drop-shadow-[0_0_80px_#00FFA3]"
        yRange={[0, -200]}
        rotateRange={[0, 45]}
        delay={0.2}
      />
      <GlassShape
        className="top-[40%] left-[-5%] w-48 h-48 md:w-72 md:h-72 opacity-50 drop-shadow-[0_0_60px_#38bdf8]"
        yRange={[0, 100]}
        rotateRange={[0, -90]}
        delay={0.5}
      />
      <GlassShape
        className="bottom-[10%] left-[30%] w-32 h-32 md:w-48 md:h-48 opacity-40 drop-shadow-[0_0_40px_#a21caf]"
        yRange={[0, -150]}
        xRange={[0, 50]}
        scale={0.8}
        delay={0.8}
      />
      {/* Animated light sweep */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute left-0 top-1/3 w-full h-1 bg-gradient-to-r from-transparent via-neon-400/40 to-transparent blur-lg opacity-60"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {/* Background Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
    </div>
  );
};