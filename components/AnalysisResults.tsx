
import React, { useRef, useState, useEffect } from 'react';
import { SwingAnalysis } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  analysis: SwingAnalysis;
  videoUrl: string;
}

const AnalysisResults: React.FC<Props> = ({ analysis, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLoopActive, setIsLoopActive] = useState(false);

  const chartData = [
    { name: 'Score', value: analysis.overallScore },
    { name: 'Remaining', value: 100 - analysis.overallScore },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-amber-500';
      case 'needs-work': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  // Video Controls Logic
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);

      if (isLoopActive && loopStart !== null && loopEnd !== null) {
        if (curr >= loopEnd || curr < loopStart) {
          videoRef.current.currentTime = loopStart;
          if (!isPlaying) {
             videoRef.current.play();
             setIsPlaying(true);
          }
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleLoopPoint = (point: 'start' | 'end') => {
    if (point === 'start') {
      setLoopStart(currentTime);
      if (loopEnd !== null && currentTime >= loopEnd) setLoopEnd(null);
    } else {
      if (loopStart !== null && currentTime > loopStart) {
        setLoopEnd(currentTime);
        setIsLoopActive(true);
      }
    }
  };

  const clearLoop = () => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLoopActive(false);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar - Video & Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Video Player */}
          <div className="relative aspect-[9/16] bg-black group">
            <video 
              ref={videoRef}
              src={videoUrl} 
              className="w-full h-full object-contain" 
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
            />
            
            {/* Play Overlay (Big button) */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/90 flex items-center justify-center text-slate-900 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform">
                  <i className="fas fa-play text-2xl ml-1"></i>
                </div>
              </div>
            )}
            
            {/* Loop Indicators on Video */}
            {loopStart !== null && loopEnd !== null && isLoopActive && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/80 rounded-full text-xs font-bold text-slate-900 backdrop-blur-md animate-pulse">
                <i className="fas fa-repeat mr-1"></i> Loop Active
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-slate-800/90 border-t border-slate-700 space-y-4">
            {/* Seeker */}
            <div className="relative w-full h-2 bg-slate-700 rounded-full group cursor-pointer">
               {/* Loop Markers on Track */}
               {loopStart !== null && (
                <div 
                  className="absolute top-0 bottom-0 bg-emerald-500/30 border-l-2 border-emerald-500 z-0"
                  style={{ 
                    left: `${(loopStart / duration) * 100}%`,
                    width: loopEnd ? `${((loopEnd - loopStart) / duration) * 100}%` : '0%'
                  }}
                />
              )}
              {loopEnd !== null && (
                 <div 
                 className="absolute top-0 bottom-0 border-l-2 border-rose-500 z-10 h-4 -mt-1"
                 style={{ left: `${(loopEnd / duration) * 100}%` }}
               />
              )}
              
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              />
              <div 
                className="h-full bg-emerald-500 rounded-full pointer-events-none relative z-10"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transform scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
            </div>

            {/* Time & Speed Row */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-600">/</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex bg-slate-700 rounded-lg p-0.5">
                {[1.0, 0.5, 0.25, 0.1].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                      playbackRate === rate 
                        ? 'bg-emerald-500 text-slate-900 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate === 1.0 ? '1x' : rate + 'x'}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Actions Row */}
            <div className="flex items-center justify-between gap-2">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition-colors"
              >
                <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
              </button>

              <div className="flex-1 flex justify-center gap-2">
                <button 
                  onClick={() => toggleLoopPoint('start')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    loopStart !== null 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Set Loop Start (A)"
                >
                  <i className="fas fa-step-backward mr-1"></i> A
                </button>
                
                <button 
                  onClick={() => setIsLoopActive(!isLoopActive)}
                  disabled={loopStart === null || loopEnd === null}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isLoopActive 
                      ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                      : 'bg-slate-700 border-transparent text-slate-500 disabled:opacity-50'
                  }`}
                  title="Toggle Loop"
                >
                  <i className="fas fa-repeat"></i>
                </button>

                <button 
                  onClick={() => toggleLoopPoint('end')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    loopEnd !== null 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                      : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Set Loop End (B)"
                >
                  B <i className="fas fa-step-forward ml-1"></i>
                </button>
              </div>

              {(loopStart !== null || loopEnd !== null) && (
                <button 
                  onClick={clearLoop}
                  className="w-10 h-10 rounded-xl bg-slate-700/50 text-slate-400 flex items-center justify-center hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Clear Loop"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 text-center shadow-xl">
          <h3 className="text-slate-400 font-semibold mb-2 uppercase tracking-wider text-xs">Swing Score</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={450}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-black text-white">{analysis.overallScore}</span>
              <span className="text-slate-400 text-xs font-bold">/ 100</span>
            </div>
          </div>
          <p className="mt-4 text-slate-300 font-medium">{analysis.summary}</p>
        </div>
      </div>

      {/* Main Analysis Content */}
      <div className="lg:col-span-8 space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.metrics.map((metric, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-100">{metric.name}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(metric.status)} text-slate-900`}>
                  {metric.status}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mb-3">
                <div 
                  className={`h-1.5 rounded-full ${getStatusColor(metric.status)} transition-all duration-1000`} 
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{metric.description}</p>
            </div>
          ))}
        </div>

        {/* Pros & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <i className="fas fa-circle-check text-xl"></i>
              <h3 className="text-lg font-bold">Key Strengths</h3>
            </div>
            <ul className="space-y-3">
              {analysis.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <i className="fas fa-circle-exclamation text-xl"></i>
              <h3 className="text-lg font-bold">Refinement Areas</h3>
            </div>
            <ul className="space-y-3">
              {analysis.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Drills Section */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6 text-indigo-400">
            <i className="fas fa-dumbbell text-xl"></i>
            <h3 className="text-xl font-bold text-white">Recommended Drills</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {analysis.drills.map((drill, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-400/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                  {idx + 1}
                </div>
                <p className="text-slate-200 font-medium">{drill}</p>
                <i className="fas fa-chevron-right ml-auto text-slate-600"></i>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
