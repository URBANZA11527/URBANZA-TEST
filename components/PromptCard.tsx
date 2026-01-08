
import React, { useState } from 'react';

interface PromptCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const PromptCard: React.FC<PromptCardProps> = ({ title, content, icon }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={copyToClipboard}
      className={`bg-white rounded-xl shadow-sm border p-5 transition-all group cursor-pointer relative overflow-hidden ${
        copied ? 'border-green-500 ring-1 ring-green-100' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${
            copied ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
          }`}>
            {icon}
          </div>
          <h4 className="font-semibold text-slate-800">{title}</h4>
        </div>
        <span className={`text-[10px] font-bold transition-opacity ${
          copied ? 'text-green-600' : 'text-indigo-500 opacity-0 group-hover:opacity-100'
        }`}>
          {copied ? 'COPIED!' : 'CLICK TO COPY'}
        </span>
      </div>
      <p className="text-sm text-slate-600 italic leading-relaxed line-clamp-4">
        "{content}"
      </p>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase border border-indigo-100">8K Photoreal</span>
        <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold uppercase border border-green-100">Design Integrity</span>
        <span className="text-[9px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold uppercase border border-orange-100">Team Maria Quality</span>
      </div>
    </div>
  );
};

export default PromptCard;
