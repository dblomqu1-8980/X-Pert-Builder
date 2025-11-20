import React, { useState } from 'react';
import { generateTweets } from './services/geminiService';
import { TweetStyle, PostType, GeneratedResult, TweetOption } from './types';
import TweetCard from './components/TweetCard';

const App: React.FC = () => {
  // State
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<TweetStyle>(TweetStyle.PROFESSIONAL);
  const [type, setType] = useState<PostType>(PostType.SINGLE);
  const [useSearch, setUseSearch] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateTweets({ topic, style, type, useSearch });
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate tweets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar / Control Panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col h-auto md:h-screen overflow-y-auto sticky top-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            X-Pert Builder
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Build your AI brand on X.</p>
        </div>

        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              What do you want to post about?
            </label>
            <textarea
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white placeholder-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              rows={3}
              placeholder="e.g. Gemini 1.5 Pro Context Window, Sam Altman's latest interview..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Vibe / Style
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(TweetStyle).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    style === s
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Format
            </label>
            <div className="flex gap-2">
              {Object.values(PostType).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
                    type === t
                      ? 'bg-neutral-100 text-black font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Search Toggle */}
          <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-800">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Ground with Google Search</span>
              <span className="text-xs text-neutral-500">Find latest news & facts</span>
            </div>
            <button
              onClick={() => setUseSearch(!useSearch)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useSearch ? 'bg-blue-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useSearch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={!topic || loading}
            className={`w-full py-3 rounded-lg font-bold text-lg shadow-lg transition-all ${
              !topic || loading
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Posts'
            )}
          </button>
        </div>
      </div>

      {/* Main Content / Preview Area */}
      <div className="flex-1 bg-black p-6 md:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-600 space-y-4">
              <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <p className="text-lg font-light">Ready to build your authority?</p>
              <p className="text-sm">Configure your post settings on the left to get started.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {result && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white">Drafts</h2>
                  <p className="text-neutral-400 mt-1">Here are 3 AI-generated options for you.</p>
                </div>
                {result.sources && result.sources.length > 0 && (
                   <div className="text-right">
                     <p className="text-xs font-bold text-green-400 mb-1 uppercase tracking-wide">Grounded with Search</p>
                     <div className="flex -space-x-2 justify-end">
                       {result.sources.slice(0,3).map((s, i) => (
                         <a key={i} href={s.uri} target="_blank" rel="noreferrer" title={s.title} className="w-6 h-6 rounded-full bg-neutral-700 border border-black flex items-center justify-center text-[10px] hover:scale-110 transition-transform cursor-pointer">
                           🌐
                         </a>
                       ))}
                     </div>
                   </div>
                )}
              </div>

              <div className="grid gap-4">
                {result.options.map((option, idx) => (
                  <TweetCard key={idx} option={option} index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;