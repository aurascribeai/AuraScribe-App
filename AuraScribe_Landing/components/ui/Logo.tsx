import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img
      src="/logo.jpeg"
      alt="AuraScribe Logo"
      className={className}
      style={{ display: 'block' }}
    />
  );
};
