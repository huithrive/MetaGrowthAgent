import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto", inverted = false }) => {
  const [imgError, setImgError] = useState(false);

  // Fallback to text if the image is missing or in the wrong folder
  if (imgError) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
             <span className={`font-header font-bold tracking-tighter uppercase ${inverted ? 'text-white' : 'text-black'} text-2xl leading-none`}>
                JAVIS
            </span>
        </div>
    );
  }

  return (
    <img 
      src="/logo.png" 
      alt="Javis for Growth" 
      onError={() => setImgError(true)}
      className={`${className} object-contain ${inverted ? 'brightness-0 invert' : ''}`} 
    />
  );
};

export default Logo;