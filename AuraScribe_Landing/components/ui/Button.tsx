
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  href, 
  className = '',
  ...props 
}) => {
  const baseStyles = "relative group overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none rounded-full active:scale-[0.98] tracking-wide";
  
  const variants = {
    // Neon Glow Primary
    primary: "bg-neon-400 text-slate-950 hover:bg-neon-500 shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:shadow-[0_0_35px_rgba(0,255,163,0.6)] border border-transparent font-bold",
    
    // Glassmorphic
    glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-neon-400/50 hover:shadow-[0_0_20px_rgba(0,255,163,0.15)]",
    
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    outline: "border border-slate-700 text-slate-300 hover:border-neon-400 hover:text-neon-400 bg-transparent",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base font-semibold",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
    </>
  );

  if (href) {
    // Check if external link (starts with http)
    const isExternal = href.startsWith('http');
    
    return (
      <a 
        href={href} 
        className={classes}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
};
