
import React from 'react';
import { AnalysisResult } from '../types';
import { Target, Zap, TrendingUp, Users, Smartphone, Clock, ShieldCheck } from 'lucide-react';
import MetaConnect from './MetaConnect';
import Logo from './Logo';

interface DashboardProps {
  data: AnalysisResult;
  websiteUrl: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, websiteUrl }) => {
  return (
    <div className="relative z-10 w-full min-h-screen text-trek-blue p-4 pt-20 pb-20 font-sans">
        
        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            
            {/* Header / Summary Block */}
            <div className="lg:col-span-12">
                <div className="border-t-2 border-b-2 border-trek-gold/50 bg-trek-panel p-6 flex flex-col md:flex-row justify-between items-center backdrop-blur-md mb-6 gap-4">
                    <div>
                        <div className="text-trek-gold font-mono text-xs uppercase mb-1">Target Analysis Protocol</div>
                        <h2 className="text-3xl text-white font-header tracking-wide uppercase">{websiteUrl}</h2>
                    </div>
                    <div className="flex gap-8">
                         <div className="text-right">
                             <div className="text-trek-gold font-mono text-xs uppercase mb-1">Market Opportunity</div>
                             <div className="text-2xl text-white font-bold font-mono">{data.grossOpportunity}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-trek-red font-mono text-xs uppercase mb-1">Identified Gap</div>
                             <div className="text-2xl text-white font-bold font-mono max-w-[200px] truncate">{data.marketGap}</div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Left Column (Traffic Data & Strategy) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Traffic Intelligence Table */}
                <div className="bg-trek-dark/80 border border-trek-blue/30 rounded-xl overflow-hidden">
                    <div className="bg-trek-blue/10 p-4 border-b border-trek-blue/30 flex items-center gap-2">
                        <TrendingUp size={20} className="text-trek-gold" />
                        <h3 className="font-header text-xl uppercase text-white">Competitor Traffic Intelligence</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-sm">
                            <thead>
                                <tr className="bg-black text-trek-blue/60 uppercase text-xs">
                                    <th className="p-4">Entity</th>
                                    <th className="p-4">Monthly Visits</th>
                                    <th className="p-4">Bounce Rate</th>
                                    <th className="p-4">Avg Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.competitors.map((comp, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors text-slate-300">
                                        <td className="p-4 font-bold text-white uppercase">{comp.name}</td>
                                        <td className="p-4 text-trek-gold">{comp.traffic?.monthlyVisits || '-'}</td>
                                        <td className="p-4">{comp.traffic?.bounceRate || '-'}</td>
                                        <td className="p-4">{comp.traffic?.avgDuration || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 bg-black text-[10px] font-mono text-slate-500 text-right uppercase">
                        Data Source: Paid RapidAPI Network Protocol
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="relative bg-black/80 border-l-4 border-trek-gold p-6 rounded-r-xl">
                     <h3 className="text-trek-gold font-header text-lg uppercase mb-3">Analysis Logic</h3>
                    <p className="text-lg leading-relaxed text-trek-blue/90 font-mono">
                        {data.executiveSummary}
                    </p>
                </div>

                {/* Options Grid */}
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2 mt-8">
                        <Zap className="text-trek-gold" size={20} />
                        <h3 className="text-white font-header text-xl uppercase tracking-widest">Growth Vectors (Meta Ads)</h3>
                     </div>
                     
                     {data.options.map((opt, idx) => (
                        <div key={idx} className="group relative bg-trek-panel border border-trek-purple/30 p-6 hover:border-trek-purple transition-all rounded-lg">
                            <div className="absolute top-2 right-2 text-trek-purple/40 font-mono text-xs">VECTOR_0{idx+1}</div>
                            
                            <h4 className="text-white font-bold uppercase text-lg mb-2 font-header">{opt.label}</h4>
                            <p className="text-sm text-slate-300 mb-4 font-mono">{opt.hypothesis}</p>
                            
                            <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                <div className="flex gap-2">
                                    {opt.requirements.map((req, i) => (
                                        <span key={i} className="text-[10px] uppercase bg-trek-purple/20 text-trek-purple px-2 py-1 rounded">
                                            {req}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-trek-gold font-bold font-mono">{opt.projectedImpact}% EFFICIENCY</div>
                            </div>
                        </div>
                     ))}
                </div>

            </div>

            {/* Right Column (Meta Connect & Audit) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* FREE AUDIT CALL TO ACTION */}
                <div className="bg-gradient-to-br from-trek-blue/20 to-black border-2 border-trek-gold p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 bg-trek-gold/20 w-40 h-40 rounded-full blur-2xl group-hover:bg-trek-gold/30 transition-all"></div>
                    
                    <div className="relative z-10 text-center">
                        <ShieldCheck className="mx-auto text-trek-gold mb-4" size={48} />
                        <h3 className="text-2xl font-header font-bold text-white uppercase mb-2">Free Campaign Audit</h3>
                        <p className="text-sm font-mono text-slate-300 mb-6">
                            Jarvis has identified operational inefficiencies. Connect your Ad Account for a deep-dive diagnostic.
                        </p>
                        
                        <MetaConnect websiteUrl={websiteUrl} />
                    </div>
                </div>

                {/* Operational Advice Widget */}
                <div className="bg-trek-dark p-6 rounded-lg border border-white/10">
                    <h4 className="text-trek-blue font-header text-lg uppercase mb-4 flex items-center gap-2">
                        <Smartphone size={16} /> Operational Advice
                    </h4>
                    <ul className="space-y-4 font-mono text-xs text-slate-400">
                        <li className="flex gap-3">
                            <div className="min-w-[4px] h-full bg-trek-red"></div>
                            <p>Traffic data suggests competitors are using <span className="text-white">High Velocity Video</span> creatives to lower bounce rate.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="min-w-[4px] h-full bg-trek-gold"></div>
                            <p>Opportunity to undercut on <span className="text-white">Mobile Feeds</span> where competitor spend is inefficient.</p>
                        </li>
                    </ul>
                </div>

                <div className="opacity-50 text-center">
                    <Logo className="h-6 w-auto mx-auto mb-2" />
                    <p className="text-[10px] font-mono uppercase text-trek-blue/40">Secured via Quantum Encryption</p>
                </div>

            </div>
        </div>
    </div>
  );
};

export default Dashboard;
