
import React, { useState } from 'react';
import { Crosshair, Scan, CheckSquare, Square } from 'lucide-react';
import { Competitor } from '../types';
import Logo from './Logo';

interface CompetitorSelectProps {
  competitors: Competitor[];
  onConfirm: (finalCompetitors: Competitor[]) => void;
}

const CompetitorSelect: React.FC<CompetitorSelectProps> = ({ competitors, onConfirm }) => {
  // Initialize with no selections
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      if (selectedIndices.length < 3) {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedIndices.length === 3) {
      const selectedCompetitors = selectedIndices.map(i => competitors[i]);
      onConfirm(selectedCompetitors);
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col">
       {/* Top LCARS Bar with Logo */}
       <div className="absolute top-0 left-0 w-full flex items-center p-4 gap-2 opacity-90 z-20">
        <div className="h-12 bg-white rounded-full flex items-center justify-center px-4 min-w-[140px]">
            <Logo className="h-8 w-auto" />
        </div>
        <div className="h-8 w-16 bg-trek-gold rounded-full self-start mt-2"></div>
        <div className="h-8 flex-1 bg-trek-blue rounded-full flex items-center justify-end px-6 self-start mt-2">
            <span className="text-black font-header font-bold tracking-widest text-sm">TARGET CONFIRMATION</span>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 pt-32 pb-10 flex-1">
        <div className="bg-trek-panel border-t-8 border-trek-gold p-8 rounded-b-2xl backdrop-blur-xl">
            
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Scan className="text-trek-gold animate-pulse" size={32} />
                    <div>
                        <h2 className="text-2xl font-header text-white uppercase tracking-widest">Sector Scan Complete</h2>
                        <p className="text-trek-blue/60 font-mono text-xs uppercase">Select 3 Vectors for Deep Analysis</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-trek-red font-mono text-xs">SELECTION REQUIRED</div>
                    <div className="text-white font-header text-xl">{selectedIndices.length} / 3 TARGETS</div>
                </div>
            </div>
            
            <p className="text-slate-300 mb-8 font-mono text-sm leading-relaxed max-w-2xl">
                Jarvis has intercepted signals from the following entities.
                <span className="text-trek-gold"> Select exactly 3 competitors to pull paid traffic data.</span>
            </p>

            <div className="grid grid-cols-1 gap-4 mb-10">
            {competitors.map((comp, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                    <div 
                        key={idx} 
                        onClick={() => toggleSelection(idx)}
                        className={`relative cursor-pointer border p-4 flex items-center justify-between group transition-all ${isSelected ? 'bg-trek-blue/20 border-trek-gold' : 'bg-black/40 border-trek-blue/20 hover:border-trek-blue'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`text-trek-gold transition-transform ${isSelected ? 'scale-110' : 'opacity-50'}`}>
                                {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                            </div>
                            <div>
                                <h3 className={`font-header text-lg uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-400'}`}>{comp.name}</h3>
                                <p className="text-xs text-slate-500 font-mono">{comp.url}</p>
                            </div>
                        </div>
                        
                        <div className="text-right hidden md:block">
                            <span className="inline-block bg-trek-blue/10 text-trek-blue text-[10px] px-2 py-1 uppercase font-mono border border-trek-blue/20">
                                {comp.strength}
                            </span>
                        </div>
                    </div>
                );
            })}
            </div>

            <div className="flex justify-end items-center gap-6">
                <div className="hidden md:block h-1 flex-1 bg-trek-blue/10"></div>
                <button
                    onClick={handleConfirm}
                    disabled={selectedIndices.length !== 3}
                    className={`px-12 py-4 font-header text-xl tracking-widest uppercase transition-all flex items-center gap-3 rounded-full ${selectedIndices.length === 3 ? 'bg-trek-gold hover:bg-white text-black cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                    Pull Traffic Data <Crosshair size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorSelect;
