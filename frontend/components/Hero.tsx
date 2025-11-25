import React, { useState } from 'react';
import { ArrowRight, Cpu, Activity, Crosshair, CheckCircle, Zap, Shield } from 'lucide-react';
import Logo from './Logo';

interface HeroProps {
  onStart: (url: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('.') || url.length < 4) {
      setError('INVALID_DOMAIN_SYNTAX');
      return;
    }
    setError('');
    onStart(url);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
      
      {/* Top LCARS Bar with Logo */}
      <div className="absolute top-0 left-0 w-full flex items-center p-4 gap-2 opacity-90 z-20">
        <div className="h-12 bg-white rounded-full flex items-center justify-center px-4 min-w-[140px]">
            <Logo className="h-8 w-auto" />
        </div>
        <div className="h-8 w-16 bg-trek-red rounded-full self-start mt-2"></div>
        <div className="h-8 flex-1 bg-trek-blue rounded-full flex items-center justify-between px-6 self-start mt-2">
            <span className="text-black font-header font-bold tracking-widest text-sm md:text-lg">JARVIS AI - PAID ADS INTELLIGENCE</span>
            <span className="hidden md:block text-black font-mono text-xs font-bold">V3.0.1</span>
        </div>
      </div>

      <div className="max-w-6xl w-full mt-10">
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Bracket Graphic */}
            <div className="hidden md:flex flex-col w-24 lg:w-32 shrink-0">
                <div className="h-40 w-full bg-trek-gold rounded-tl-3xl mb-2 flex items-end justify-end p-2">
                    <span className="text-black font-header text-4xl font-bold">01</span>
                </div>
                <div className="h-20 w-full bg-trek-pale rounded-l-lg mb-2"></div>
                <div className="flex-1 w-12 bg-trek-purple rounded-bl-3xl ml-auto border-r-4 border-black"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 pt-4 md:pt-12">
                
                {/* Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-header font-bold text-white tracking-tighter uppercase leading-[0.9] mb-8">
                    Stop Burning <br/>
                    <span className="text-trek-blue">Money On</span> <br/>
                    <span className="text-trek-red">Facebook Ads.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-trek-blue/90 font-mono mb-12 max-w-2xl leading-relaxed border-l-4 border-trek-gold pl-6">
                    JARVIS analyzes your Meta campaigns, identifies what's broken, and tells you exactly how to fix it. 
                    <br/><span className="text-trek-gold font-bold">IN MINUTES, NOT MONTHS.</span>
                </p>

                {/* Command Input Console */}
                <form onSubmit={handleSubmit} className="relative bg-trek-panel border border-trek-blue/30 p-1 md:p-8 rounded-xl max-w-2xl group">
                    <div className="absolute -top-3 left-6 bg-black px-2 text-trek-gold text-xs font-header tracking-widest uppercase border border-trek-gold/30">
                        Input Coordinates
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-trek-blue/50 font-mono text-xs uppercase tracking-widest ml-1">
                            Enter Your E-commerce Website
                        </label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="WWW.GETMOURISH.COM"
                                className="flex-1 bg-black border-2 border-trek-blue/50 text-white p-4 font-mono text-lg focus:outline-none focus:border-trek-gold focus:bg-trek-blue/5 transition-colors rounded-lg placeholder-white/20 uppercase tracking-wider"
                            />
                            
                            <button
                                type="submit"
                                className="lcars-btn bg-trek-blue hover:bg-white text-black px-8 py-4 rounded-lg flex items-center justify-center gap-2 font-bold text-lg min-w-[200px]"
                            >
                                Activate JARVIS <ArrowRight size={20} />
                            </button>
                        </div>
                        <p className="text-xs text-trek-blue/40 font-mono mt-2 uppercase">
                            * Connect your Meta account for deeper campaign analysis
                        </p>
                    </div>
                    
                    {error && (
                        <div className="absolute -bottom-8 left-0 text-trek-red font-mono text-sm uppercase flex items-center gap-2 animate-pulse">
                             <Crosshair size={14} /> 
                             ERROR: {error}
                        </div>
                    )}
                </form>

                {/* Trust Signals / Footer Data */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-trek-blue/20 pt-6 max-w-3xl">
                    <div className="flex items-center gap-3 text-trek-blue/80">
                        <Zap size={18} className="text-trek-gold" />
                        <span className="font-header tracking-wider uppercase text-lg">2-3 Min Analysis</span>
                    </div>
                    <div className="flex items-center gap-3 text-trek-blue/80">
                        <Shield size={18} className="text-trek-gold" />
                        <span className="font-header tracking-wider uppercase text-lg">Meta Ads Certified</span>
                    </div>
                    <div className="flex items-center gap-3 text-trek-blue/80">
                        <CheckCircle size={18} className="text-trek-gold" />
                        <span className="font-header tracking-wider uppercase text-lg">$297 One-Time</span>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;