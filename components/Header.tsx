
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <i className="fas fa-golf-ball-tee text-white text-xl"></i>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          ProSwing AI
        </h1>
      </div>
      <nav className="hidden md:flex gap-6 text-slate-400 font-medium">
        <a href="#" className="hover:text-emerald-400 transition-colors">Analyzer</a>
        <a href="#" className="hover:text-emerald-400 transition-colors">History</a>
        <a href="#" className="hover:text-emerald-400 transition-colors">Drills</a>
        <a href="#" className="hover:text-emerald-400 transition-colors">Pro Coaching</a>
      </nav>
      <div className="flex gap-4">
        <button className="px-4 py-2 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
          Log In
        </button>
        <button className="px-4 py-2 rounded-full bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition-colors">
          Get Started
        </button>
      </div>
    </header>
  );
};

export default Header;
