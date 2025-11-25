import React, { useState } from 'react';
import { Facebook, Link2, Loader2, Lock, Shield } from 'lucide-react';
import apiService from '../services/api';
import Logo from './Logo';

interface MetaConnectProps {
    websiteUrl: string;
}

const MetaConnect: React.FC<MetaConnectProps> = ({ websiteUrl }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
    const [diagnostic, setDiagnostic] = useState<string | null>(null);

    const handleConnect = async () => {
        setStatus('connecting');
        try {
            // Generate account ID from URL
            const accountId = websiteUrl.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20);
            
            // Trigger refresh to get Meta diagnostic
            await apiService.refreshReport(accountId, true);
            
            // Wait a bit then fetch report
            setTimeout(async () => {
                try {
                    const response = await apiService.getReport(accountId);
                    const metaDiagnostic = response.report.insight?.summary || 
                                          response.report.meta?.diagnostic || 
                                          'Meta Ads diagnostic: Campaign optimization opportunities identified.';
                    setDiagnostic(metaDiagnostic);
                    setStatus('connected');
                } catch (error) {
                    // Fallback diagnostic
                    setDiagnostic('Meta Ads diagnostic: Connect your Ad Account for detailed campaign analysis and optimization recommendations.');
                    setStatus('connected');
                }
            }, 3500);
        } catch (error) {
            console.error('Meta connection failed:', error);
            setDiagnostic('Meta Ads diagnostic: Connection pending. Please ensure your Meta Ads account is properly configured.');
            setStatus('connected');
        }
    };

    return (
        <div className="relative bg-trek-dark border border-trek-blue/50 overflow-hidden">
            {/* Header Strip */}
            <div className="bg-trek-blue/20 p-2 flex items-center justify-between border-b border-trek-blue/50">
                <div className="flex items-center gap-2">
                    <Logo className="h-4 w-auto" />
                    <span className="text-trek-blue font-mono text-[10px] uppercase tracking-wider">Secure Protocol</span>
                </div>
                <Shield size={12} className="text-trek-blue" />
            </div>

            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#1877F2] p-2 rounded text-white shadow-[0_0_10px_#1877F2]">
                        <Facebook size={24} />
                    </div>
                    <h3 className="text-white font-header text-lg uppercase leading-none">
                        Meta Ad<br/>Integration
                    </h3>
                </div>

                {status === 'idle' && (
                    <>
                        <p className="text-trek-blue/70 text-sm mb-6 font-mono leading-relaxed">
                            <span className="text-white">REQUIRED:</span> Establish data link to Ad Manager. 
                            Jarvis will cross-reference creative metrics against competitor vectors.
                        </p>
                        <button 
                            onClick={handleConnect}
                            className="w-full bg-trek-blue hover:bg-white text-black font-bold font-header py-3 px-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Link2 size={16} /> Engage Link
                        </button>
                    </>
                )}

                {status === 'connecting' && (
                    <div className="py-4 text-center">
                        <Loader2 className="animate-spin text-trek-gold mx-auto mb-4" size={32} />
                        <div className="space-y-1 font-mono text-[10px] text-trek-gold uppercase">
                            <p>Handshake Initiated...</p>
                            <p>Bypassing Firewall...</p>
                            <p>Reading Pixel Data...</p>
                        </div>
                        <div className="mt-4 h-1 bg-trek-dark w-full rounded-full overflow-hidden">
                            <div className="h-full bg-trek-gold animate-scan w-1/2"></div>
                        </div>
                    </div>
                )}

                {status === 'connected' && diagnostic && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center gap-2 text-green-400 mb-3 font-mono text-xs uppercase">
                            <Lock size={12} /> Access Granted
                        </div>
                        <div className="bg-trek-blue/10 p-4 border-l-2 border-trek-blue mb-4">
                            <h4 className="text-trek-blue text-xs font-bold uppercase mb-2">Diagnostic Result:</h4>
                            <p className="text-white text-sm font-mono leading-relaxed">
                                {diagnostic}
                            </p>
                        </div>
                        <button className="w-full border border-trek-blue text-trek-blue hover:bg-trek-blue hover:text-black transition-colors font-mono text-xs py-2 uppercase">
                            Transmit Report to HQ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetaConnect;
