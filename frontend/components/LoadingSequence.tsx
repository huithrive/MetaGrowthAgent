
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface LoadingSequenceProps {
  url: string;
  messages: string[];
}

const LoadingSequence: React.FC<LoadingSequenceProps> = ({ url, messages }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Extract brand name from URL
  const brandName = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
  const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    // Replace placeholder with actual brand name
    const fullMessage = messages[currentMessageIndex].replace('***', formattedBrand);

    if (isTyping) {
      if (displayedText.length < fullMessage.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullMessage.slice(0, displayedText.length + 1));
        }, 30); // Typing speed
      } else {
        // Finished typing this sentence
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Wait before fading out
      }
    } else {
      // Move to next message
      setDisplayedText('');
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setIsTyping(true);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentMessageIndex, messages, formattedBrand]);

  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 bg-black">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,10,20,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,10,20,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        
        <div className="z-10 max-w-2xl w-full">
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute -inset-4 bg-trek-blue/20 rounded-full blur-xl animate-pulse"></div>
                    <Logo className="h-12 w-auto" />
                </div>
            </div>

            <div className="h-48 flex items-center justify-center">
                <p className="text-2xl md:text-3xl font-mono text-trek-blue leading-relaxed text-center">
                    {displayedText}
                    <span className="inline-block w-3 h-8 ml-1 bg-trek-gold animate-blink align-middle"></span>
                </p>
            </div>

            {/* LCARS Progress Bar */}
            <div className="mt-12 flex items-center gap-2">
                <div className="h-4 w-24 bg-trek-gold rounded-l-full"></div>
                <div className="h-4 flex-1 bg-trek-dark border border-trek-blue/30 rounded-r-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-trek-blue/50 w-1/3 animate-scan"></div>
                </div>
                <div className="font-header text-trek-gold text-xl">PROCESSING</div>
            </div>
        </div>
    </div>
  );
};

export default LoadingSequence;
