
import React from 'react';

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-1.383-.597 15.218 15.218 0 0 1-1.923-1.013c-1.352-1.12-2.355-2.453-2.9-4.009-.434-1.328-.598-2.675-.5-4.004.1-1.37.59-2.67 1.405-3.805a5.414 5.414 0 0 1 2.48-1.91c.79-.3 1.63-.444 2.48-.445.85.001 1.69.145 2.48.445a5.414 5.414 0 0 1 2.48 1.91c.815 1.135 1.305 2.435 1.405 3.805.1 1.33-.066 2.676-.5 4.004-.545 1.556-1.548 2.889-2.9 4.009-1.352 1.12-2.355 2.453-2.9 4.009-.594.55-1.144.97-1.63 1.282-.597.375-1.17.614-1.64.717-.05.01-.1.017-.15.022Zm.292-1.842a13.368 13.368 0 0 0 3.395-2.366c1.233-1.02 2.11-2.23 2.585-3.61.41-1.19.54-2.37.45-3.53-.09-1.22-.5-2.37-1.17-3.38a3.52 3.52 0 0 0-2.22-1.5c-.7-.23-1.42-.34-2.12-.34s-1.42.11-2.12.34a3.52 3.52 0 0 0-2.22 1.5c-.67 1.01-1.08 2.16-1.17 3.38-.09 1.16.04 2.34.45 3.53.475 1.38 1.352 2.59 2.585 3.61a13.368 13.368 0 0 0 3.395 2.366Z" />
  </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <div className="flex items-center gap-3 text-2xl font-bold text-white">
          <HeartIcon className="w-8 h-8 text-rose-500" />
          <h1>AI Persona Dating</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
