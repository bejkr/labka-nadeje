
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark'; // light = text is white (for dark backgrounds), dark = text is dark (for light backgrounds)
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main Pad */}
    <path
      d="M 52 92 C 75 97 85 80 85 72 C 85 62 78 51 62 51 C 56 41 43 41 36 51 C 23 51 15 63 15 71 C 15 80 25 97 49 92 Z"
      className="fill-brand-600"
    />

    {/* Toes */}
    <ellipse cx="20" cy="40" rx="12" ry="15" transform="rotate(-20 20 40)" className="fill-brand-600" />
    <ellipse cx="40" cy="25" rx="12" ry="15" transform="rotate(-10 40 25)" className="fill-brand-600" />
    <ellipse cx="60" cy="25" rx="12" ry="15" transform="rotate(10 60 25)" className="fill-brand-600" />
    <ellipse cx="80" cy="40" rx="12" ry="15" transform="rotate(20 80 40)" className="fill-brand-600" />

    {/* Heart Cutout (White) */}
    <path
      d="M50 88C50 88 65 80 65 70C65 64 60 60 55 60C51 60 48 62 50 65C52 62 49 60 45 60C40 60 35 64 35 70C35 80 50 88 50 88Z"
      fill="white"
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ className = "h-10", showText = true, variant = 'dark' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon className="h-full w-auto" />
      {showText && (
        <div className={`font-extrabold text-xl leading-none flex flex-col justify-center ${variant === 'light' ? 'text-white' : 'text-[#4a3b32]'}`}>
          <span>Labka</span>
          <span>Nádeje</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
