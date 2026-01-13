
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import VideoUploader from './components/VideoUploader';
import AnalysisResults from './components/AnalysisResults';
import { SwingAnalysis, VideoFile } from './types';
import { analyzeGolfSwing, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const loadingMessages = [
    "Uploading video sequence...",
    "Calibrating stance and posture...",
    "Tracing club head velocity...",
    "Analyzing swing plane symmetry...",
    "Calculating impact efficiency...",
    "Generating professional drills..."
  ];

  const handleVideoSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setVideoFile({ file, previewUrl });

    try {
      // Rotate messages for better UX
      let msgIndex = 0;
      const msgInterval = setInterval(() => {
        setLoadingStep(loadingMessages[msgIndex]);
        msgIndex = (msgIndex + 1) % loadingMessages.length;
      }, 2500);

      const base64 = await fileToBase64(file);
      const result = await analyzeGolfSwing(base64, file.type);
      
      clearInterval(msgInterval);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze swing. The video might be too long or in an unsupported format. Please try a shorter clip.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {!videoFile && !isLoading && (
          <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Unlock Your <span className="text-emerald-500">Perfect</span> Swing.
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Experience pro-level coaching in seconds. Our AI analyzes 240 frames per second to perfect your mechanics.
              </p>
            </div>
            
            <VideoUploader onVideoSelected={handleVideoSelected} isLoading={isLoading} />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-slate-900">
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">100k+</div>
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Swings Analyzed</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">98%</div>
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Accuracy Rate</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">Pro</div>
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">AI Coaching</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">&lt; 10s</div>
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Analysis Time</div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-md mx-auto py-24 text-center">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-golf-ball-tee text-emerald-500 text-2xl animate-pulse"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Analyzing Performance</h3>
            <p className="text-slate-400 font-medium animate-pulse transition-all h-6">
              {loadingStep}
            </p>
            <div className="mt-8 w-full bg-slate-900 rounded-full h-1 overflow-hidden">
              <div className="bg-emerald-500 h-full animate-progress-indeterminate"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
            <i className="fas fa-triangle-exclamation text-rose-500 text-3xl mb-4"></i>
            <h3 className="text-xl font-bold text-white mb-2">Analysis Interrupted</h3>
            <p className="text-rose-200/70 mb-6">{error}</p>
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all"
            >
              Try Different Video
            </button>
          </div>
        )}

        {analysis && videoFile && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <button 
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white flex items-center gap-2 mb-2 transition-colors font-medium"
                >
                  <i className="fas fa-arrow-left"></i> Analyze Another Swing
                </button>
                <h2 className="text-3xl font-black text-white">Your Swing Report</h2>
              </div>
              <div className="flex gap-3">
                <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-all">
                  <i className="fas fa-share-nodes"></i>
                </button>
                <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-all">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
            
            <AnalysisResults analysis={analysis} videoUrl={videoFile.previewUrl} />
          </div>
        )}
      </main>

      <footer className="bg-slate-900/50 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ProSwing AI. Built with Gemini 3 Pro Video Understanding.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-emerald-400">Terms of Service</a>
          <a href="#" className="hover:text-emerald-400">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-400">Support</a>
        </div>
      </footer>

      <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(200%); width: 30%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
