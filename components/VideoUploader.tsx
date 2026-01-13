
import React, { useRef } from 'react';

interface Props {
  onVideoSelected: (file: File) => void;
  isLoading: boolean;
}

const VideoUploader: React.FC<Props> = ({ onVideoSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelected(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-8 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/50 text-center hover:border-emerald-500/50 transition-all">
      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 text-emerald-500 border border-slate-700 shadow-xl">
        <i className="fas fa-cloud-arrow-up text-3xl"></i>
      </div>
      <h2 className="text-2xl font-bold mb-2">Upload Your Swing</h2>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto">
        Record your swing from a side-on or down-the-line angle for the most accurate AI analysis.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <input 
          type="file" 
          accept="video/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <button 
          onClick={triggerUpload}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
        >
          <i className="fas fa-file-video"></i>
          Choose Video
        </button>
        <button 
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-2xl transition-all active:scale-95"
          onClick={() => alert("Direct camera recording coming soon! Please upload a recorded video.")}
        >
          <i className="fas fa-video"></i>
          Record Live
        </button>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-sm">
        <span className="flex items-center gap-2"><i className="fas fa-bolt text-amber-500"></i> AI Powered</span>
        <span className="flex items-center gap-2"><i className="fas fa-shield-halved text-blue-500"></i> Private & Secure</span>
        <span className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> Pro Accuracy</span>
      </div>
    </div>
  );
};

export default VideoUploader;
