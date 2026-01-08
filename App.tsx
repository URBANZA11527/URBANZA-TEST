
import React, { useState, useRef } from 'react';
import { PlatformResult } from './types';
import { generatePlatformData } from './geminiService';
import PromptCard from './components/PromptCard';

type Platform = 'amazon' | 'trendyol';

const App: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<Platform>('amazon');
  const [images, setImages] = useState<{ [key in Platform]: string | null }>({
    amazon: null,
    trendyol: null,
  });
  const [loading, setLoading] = useState<{ [key in Platform]: boolean }>({
    amazon: false,
    trendyol: false,
  });
  const [results, setResults] = useState<{ [key in Platform]: PlatformResult | null }>({
    amazon: null,
    trendyol: null,
  });
  const [errors, setErrors] = useState<{ [key in Platform]: string | null }>({
    amazon: null,
    trendyol: null,
  });
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleFile = (file: File, platform: Platform) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [platform]: reader.result as string }));
        setResults(prev => ({ ...prev, [platform]: null }));
        setErrors(prev => ({ ...prev, [platform]: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, platform: Platform) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, platform);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput) return;
    try {
      setLoading(prev => ({ ...prev, [activePlatform]: true }));
      const response = await fetch(imageUrlInput);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [activePlatform]: reader.result as string }));
        setImageUrlInput('');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setErrors(prev => ({ ...prev, [activePlatform]: "Failed to load image from URL." }));
    } finally {
      setLoading(prev => ({ ...prev, [activePlatform]: false }));
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file, activePlatform);
  };

  const processImage = async (platform: Platform) => {
    const currentImage = images[platform];
    if (!currentImage) return;

    setLoading(prev => ({ ...prev, [platform]: true }));
    setErrors(prev => ({ ...prev, [platform]: null }));

    try {
      const base64Data = currentImage.split(',')[1];
      const mimeType = currentImage.split(',')[0].split(':')[1].split(';')[0];
      const result = await generatePlatformData(base64Data, mimeType);
      setResults(prev => ({ ...prev, [platform]: result }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [platform]: "Generation failed." }));
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const CopyIndicator = () => (
    <span className="text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-2">Click to copy</span>
  );

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Toast Notification */}
      {copyFeedback && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold border border-slate-700">
            {copyFeedback}
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Maria <span className="text-indigo-600">Homes</span></h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActivePlatform('amazon')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activePlatform === 'amazon' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Amazon
            </button>
            <button 
              onClick={() => setActivePlatform('trendyol')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activePlatform === 'trendyol' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Trendyol
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {activePlatform === 'amazon' ? 'Amazon Listing' : 'Trendyol Listing'}
            </h2>
            
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden aspect-square flex items-center justify-center transition-all cursor-pointer ${
                isDragging ? 'border-indigo-600 bg-indigo-50' : 
                images[activePlatform] ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 bg-slate-50'
              }`}
            >
              {images[activePlatform] ? (
                <img src={images[activePlatform]!} className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-6">
                  <p className="text-sm font-medium text-slate-600">Drag & Drop or Click</p>
                </div>
              )}
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => handleImageUpload(e, activePlatform)} accept="image/*" />
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Image Link</label>
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste URL here..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button type="submit" className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold">Load</button>
              </form>
            </div>

            <button
              disabled={!images[activePlatform] || loading[activePlatform]}
              onClick={() => processImage(activePlatform)}
              className={`w-full mt-6 py-4 rounded-2xl font-black text-sm uppercase transition-all ${
                !images[activePlatform] || loading[activePlatform] 
                ? 'bg-slate-100 text-slate-400' 
                : activePlatform === 'amazon' ? 'bg-orange-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg'
              }`}
            >
              {loading[activePlatform] ? "Generating..." : "Generate Listing"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {loading[activePlatform] && (
            <div className="bg-white rounded-3xl p-32 text-center border border-slate-200 shadow-sm">
              <div className="w-12 h-12 border-4 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-bold text-slate-800">Processing Listing...</p>
            </div>
          )}

          {!loading[activePlatform] && results[activePlatform] && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {activePlatform === 'amazon' && results.amazon && (
                <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 border-b border-slate-100 pb-6">Amazon Data</h2>
                  
                  <div className="space-y-6">
                    <div className="group cursor-pointer" onClick={() => handleCopy(results.amazon!.amazon!.seo.title, 'Title')}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">SEO Title <CopyIndicator /></h3>
                      <div className="p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 hover:border-indigo-300 transition-colors">
                        {results.amazon.amazon?.seo.title}
                      </div>
                    </div>

                    <div className="group cursor-pointer" onClick={() => handleCopy(results.amazon!.amazon!.seo.description, 'Description')}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">Description <CopyIndicator /></h3>
                      <div className="p-5 bg-slate-50 rounded-2xl text-xs leading-relaxed border border-slate-100 hover:border-indigo-300 transition-colors whitespace-pre-wrap">
                        {results.amazon.amazon?.seo.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bullet Points</h3>
                      <div className="space-y-3">
                        {results.amazon.amazon?.seo.bulletPoints.map((bp, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleCopy(bp, `Bullet ${i+1}`)}
                            className="p-4 bg-slate-50 rounded-xl text-xs border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all group"
                          >
                            <span className="font-medium text-slate-700">• {bp}</span>
                            <CopyIndicator />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* NEW: Average Size Section */}
                    <div className="group cursor-pointer" onClick={() => handleCopy(results.amazon!.amazon!.seo.averageSize, 'Average Size')}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">Average Size (CM) <CopyIndicator /></h3>
                      <div className="p-4 bg-orange-50 rounded-2xl text-sm font-black border border-orange-100 text-orange-700 hover:border-orange-300 transition-colors inline-block min-w-[150px] text-center">
                        {results.amazon.amazon?.seo.averageSize}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1:1 Photo Prompts (English)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PromptCard title="Main: White Background" content={results.amazon.amazon?.prompts.lifestyle1 || ''} icon="⬜" />
                        <PromptCard title="Lifestyle" content={results.amazon.amazon?.prompts.lifestyle2 || ''} icon="✨" />
                        <PromptCard title="Usage" content={results.amazon.amazon?.prompts.usage || ''} icon="👤" />
                        <PromptCard title="Features" content={results.amazon.amazon?.prompts.features || ''} icon="📋" />
                        <div className="md:col-span-2">
                          <PromptCard title="Sizing" content={results.amazon.amazon?.prompts.sizing || ''} icon="📐" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlatform === 'trendyol' && results.trendyol && (
                <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 border-b border-slate-100 pb-6">Trendyol Data (English)</h2>
                  
                  <div className="space-y-6">
                    <div className="group cursor-pointer" onClick={() => handleCopy(results.trendyol!.trendyol!.seo.title, 'Title')}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">Title <CopyIndicator /></h3>
                      <div className="p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 hover:border-indigo-300 transition-colors">
                        {results.trendyol.trendyol?.seo.title}
                      </div>
                    </div>

                    <div className="group cursor-pointer" onClick={() => handleCopy(results.trendyol!.trendyol!.seo.description, 'Description')}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">Description <CopyIndicator /></h3>
                      <div className="p-5 bg-slate-50 rounded-2xl text-xs leading-relaxed border border-slate-100 hover:border-indigo-300 transition-colors whitespace-pre-wrap">
                        {results.trendyol.trendyol?.seo.description}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2:3 Photo Prompts (English)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PromptCard title="Lifestyle 1" content={results.trendyol.trendyol?.prompts.lifestyle1 || ''} icon="🌆" />
                        <PromptCard title="Lifestyle 2" content={results.trendyol.trendyol?.prompts.lifestyle2 || ''} icon="📸" />
                        <PromptCard title="Usage" content={results.trendyol.trendyol?.prompts.usage || ''} icon="🤸" />
                        <PromptCard title="Features" content={results.trendyol.trendyol?.prompts.features || ''} icon="🔍" />
                        <div className="md:col-span-2">
                          <PromptCard title="Sizing" content={results.trendyol.trendyol?.prompts.sizing || ''} icon="📏" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
