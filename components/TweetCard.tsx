import React from 'react';
import { TweetOption } from '../types';

interface TweetCardProps {
  option: TweetOption;
  index: number;
}

const TweetCard: React.FC<TweetCardProps> = ({ option, index }) => {
  const handlePost = (text: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 shadow-lg hover:border-neutral-600 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Option {index + 1}</span>
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
          AI Reasoning: {option.reasoning}
        </span>
      </div>

      <div className="space-y-4 relative">
        {/* Connecting line for threads */}
        {option.content.length > 1 && (
          <div className="absolute left-5 top-4 bottom-10 w-0.5 bg-neutral-800 -z-0"></div>
        )}

        {option.content.map((tweet, i) => (
          <div key={i} className="relative z-10">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-lg">
                  🤖
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-baseline justify-between">
                  <div className="font-bold text-white mr-2">You <span className="text-neutral-500 font-normal">@AI_Expert</span></div>
                  <span className="text-neutral-500 text-sm">now</span>
                </div>
                <p className="text-neutral-200 mt-1 whitespace-pre-wrap text-[15px] leading-relaxed font-normal">
                  {tweet}
                </p>
                
                {/* Tweet Actions */}
                <div className="flex gap-4 mt-3 border-t border-neutral-800 pt-2">
                   <button 
                    onClick={() => handlePost(tweet)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                   >
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                     Post on X
                   </button>
                   <button 
                    onClick={() => copyToClipboard(tweet)}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-neutral-300"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                     Copy
                   </button>
                   <span className={`text-xs ml-auto ${tweet.length > 280 ? 'text-red-500' : 'text-neutral-500'}`}>
                     {tweet.length} chars
                   </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TweetCard;