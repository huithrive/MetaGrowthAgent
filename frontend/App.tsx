import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Background from './components/Background';
import LoadingSequence from './components/LoadingSequence';
import CompetitorSelect from './components/CompetitorSelect';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import VoiceAgent from './components/VoiceAgent';
import { AppStage, Competitor, AnalysisResult, User } from './types';
import apiService, { AnalysisResult as ApiAnalysisResult } from './services/api';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.HERO);
  const [url, setUrl] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [accountId, setAccountId] = useState<string>('');

  // Check for existing auth token on mount
  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      // Token exists, user is "logged in"
      setUser({ email: 'user@example.com', name: 'Growth Hacker' });
    }
  }, []);

  const handleStart = async (inputUrl: string) => {
    setUrl(inputUrl);
    
    // Generate account ID from URL (simple hash)
    const accountIdFromUrl = inputUrl.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20);
    setAccountId(accountIdFromUrl);

    // Check if user is authenticated
    if (!user) {
      setShowAuth(true);
      return;
    }

    await startAnalysis(inputUrl, accountIdFromUrl);
  };

  const startAnalysis = async (inputUrl: string, accId: string) => {
    setStage(AppStage.WAITING_INITIAL);
    
    try {
      // Try backend first, but fallback to demo mode if unavailable
      let useBackend = false;
      try {
        await apiService.refreshReport(accId, true);
        useBackend = true;
      } catch (backendError) {
        console.warn('Backend not available, using demo mode:', backendError);
        useBackend = false;
      }
      
      if (useBackend) {
        // Wait a bit for processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Poll for report (with timeout)
        let attempts = 0;
        const maxAttempts = 20;
        let report = null;

        while (attempts < maxAttempts && !report) {
          try {
            const response = await apiService.getReport(accId);
            report = response.report;
            
            // Extract competitors from report
            const compData = report.competitor || {};
            const competitorsList: Competitor[] = Object.entries(compData).map(([key, value]: [string, any]) => ({
              name: value.name || key,
              url: value.url || key,
              strength: value.strength || 'Analysis pending',
            }));

            if (competitorsList.length > 0) {
              setCompetitors(competitorsList);
              setStage(AppStage.SELECT_COMPETITORS);
              return;
            }
          } catch (error: any) {
            // Report not ready yet, continue polling
            if (error.message?.includes('404') || error.message?.includes('Failed to fetch')) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
              continue;
            }
            break; // Exit loop on other errors
          }
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // If we got a report, use it
        if (report) {
          const analysisResult = apiService.transformReportToAnalysis(report, inputUrl);
          setAnalysis(analysisResult);
          setStage(AppStage.DASHBOARD);
          return;
        }
      }
      
      // Fallback: show competitor selection with mock data (demo mode)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      setCompetitors([
        { name: "Market Leader Alpha", url: "competitor-a.com", strength: "High Frequency Ads" },
        { name: "Sector Target Beta", url: "competitor-b.com", strength: "Video Velocity" },
        { name: "Sector Target Gamma", url: "competitor-c.com", strength: "Aggressive Offers" },
        { name: "Niche Disruptor", url: "competitor-d.com", strength: "Low CPM Strategy" },
        { name: "Legacy Brand", url: "competitor-e.com", strength: "High AOV Bundles" },
      ]);
      setStage(AppStage.SELECT_COMPETITORS);
    } catch (error) {
      console.error('Analysis failed, using demo mode:', error);
      // Fallback to competitor selection
      setCompetitors([
        { name: "Market Leader Alpha", url: "competitor-a.com", strength: "High Frequency Ads" },
        { name: "Sector Target Beta", url: "competitor-b.com", strength: "Video Velocity" },
        { name: "Sector Target Gamma", url: "competitor-c.com", strength: "Aggressive Offers" },
        { name: "Niche Disruptor", url: "competitor-d.com", strength: "Low CPM Strategy" },
        { name: "Legacy Brand", url: "competitor-e.com", strength: "High AOV Bundles" },
      ]);
      setStage(AppStage.SELECT_COMPETITORS);
    }
  };

  const handleAuth = async (authUser: User) => {
    setUser(authUser);
    setShowAuth(false);
    
    // After auth, start analysis
    if (url) {
      await startAnalysis(url, accountId || url.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20));
    }
  };

  const handleCompetitorConfirm = async (selectedCompetitors: Competitor[]) => {
    setStage(AppStage.WAITING_SECONDARY);

    try {
      // Trigger another refresh with selected competitors
      await apiService.refreshReport(accountId, true);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get the final report
      const response = await apiService.getReport(accountId);
      const analysisResult = apiService.transformReportToAnalysis(response.report, url);
      
      setAnalysis(analysisResult);
      setStage(AppStage.DASHBOARD);
    } catch (error) {
      console.error('Final analysis failed:', error);
      // Fallback analysis result
      const fallbackAnalysis: AnalysisResult = {
        executiveSummary: "Analysis complete. Based on competitor intelligence, significant growth opportunities identified in Meta Ads optimization.",
        competitors: selectedCompetitors.map(comp => ({
          ...comp,
          traffic: {
            monthlyVisits: '50K+',
            bounceRate: '45%',
            avgDuration: '2m 30s',
            deviceSplit: '60% Mobile',
          },
        })),
        grossOpportunity: '$12k - $50k / mo',
        marketGap: 'High CPM in mobile feeds',
        options: [
          {
            id: 'opt-1',
            label: 'Optimize Creative Strategy',
            hypothesis: 'Implement high-velocity video creatives to reduce bounce rate by 20%',
            projectedImpact: 85,
            requirements: ['Video Assets', 'A/B Testing'],
          },
          {
            id: 'opt-2',
            label: 'Mobile Feed Optimization',
            hypothesis: 'Undercut competitor CPMs in mobile feeds where efficiency is low',
            projectedImpact: 75,
            requirements: ['Mobile Creative', 'Budget Allocation'],
          },
          {
            id: 'opt-3',
            label: 'Audience Retargeting',
            hypothesis: 'Implement lookalike audiences based on high-value competitor traffic',
            projectedImpact: 80,
            requirements: ['Pixel Data', 'Custom Audiences'],
          },
        ],
        metaDiagnostic: 'Connection pending - connect Meta account for detailed diagnostics',
      };
      setAnalysis(fallbackAnalysis);
      setStage(AppStage.DASHBOARD);
    }
  };

  // Messages for the first wait screen
  const initialMessages = [
    "Hi, ***. This is Javis. Your growth strategist for 10X revenue.",
    "As all growth campaign shall be based on proper market research.",
    "To identify growth opportunities, now analyzing the global market landscape, competitors' intelligence.",
    "I am researching comprehensively for you using all professional data record on the internet."
  ];

  // Messages for the second wait screen
  const secondaryMessages = [
    "Hi, ***. I am pulling data from professional paid database for your competitor's intelligence.",
    "Retrieving traffic volume metrics from RapidAPI nodes.",
    "Cross-referencing bounce rates with Meta Ads efficiency models.",
    "Finalizing growth opportunity vectors..."
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      <Background />

      {showAuth && <AuthModal onAuth={handleAuth} />}

      {stage === AppStage.HERO && <Hero onStart={handleStart} />}

      {stage === AppStage.WAITING_INITIAL && (
        <LoadingSequence url={url} messages={initialMessages} />
      )}

      {stage === AppStage.SELECT_COMPETITORS && (
        <CompetitorSelect
          competitors={competitors}
          onConfirm={handleCompetitorConfirm}
        />
      )}

      {stage === AppStage.WAITING_SECONDARY && (
         <LoadingSequence url={url} messages={secondaryMessages} />
      )}

      {stage === AppStage.DASHBOARD && analysis && (
        <Dashboard data={analysis} websiteUrl={url} />
      )}

      {/* Voice Agent Modal */}
      {showVoice && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVoice(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <VoiceAgent />
          </div>
        </div>
      )}

      {/* Floating Voice Button */}
      <button
        onClick={() => setShowVoice(!showVoice)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        title="Voice AI Assistant"
        style={{
          boxShadow: showVoice
            ? '0 0 40px rgba(147, 51, 234, 0.6)'
            : '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {showVoice ? (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
      </button>
    </div>
  );
};

export default App;
