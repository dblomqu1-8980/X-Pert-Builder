
import React from 'react';
import { PostOption, Platform } from '../types';

interface PostCardProps {
  option: PostOption;
  index: number;
  platform: Platform;
}

const PostCard: React.FC<PostCardProps> = ({ option, index, platform }) => {
  const isX = platform === Platform.X;

  const handlePost = (text: string) => {
    if (isX) {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } else {
      // LinkedIn intent
      // Note: LinkedIn doesn't have a perfect 'text' pre-fill intent for profiles without API, 
      // but this often works on desktop or redirects to share dialog.
      // Alternative: Copy to clipboard automatically.
      const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want a toast here, for now using a simple visual feedback could be better but alert is existing behavior
    // alert('Copied to clipboard!'); 
    // Let's just log it or rely on user knowing. 
    // Actually, let's show a temporary text if we can, but stateless component... 
    // Let's stick to the previous behavior or maybe no alert to be less annoying.
  };

  return (
    <div className={`border rounded-xl p-6 mb-6 shadow-lg hover:border-neutral-500 transition-colors ${isX ? 'bg-neutral-900 border-neutral-800' : 'bg-[#001e3c] border-[#0a66c2]/30'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className={`text-xs font-bold uppercase tracking-wider ${isX ? 'text-blue-400' : 'text-[#0a66c2]'}`}>
          {platform} • Option {index + 1}
        </span>
        <span className="text-xs text-neutral-400 bg-black/20 px-2 py-1 rounded">
          {option.reasoning}
        </span>
      </div>

      <div className="space-y-4 relative">
        {/* Connecting line for X threads */}
        {isX && option.content.length > 1 && (
          <div className="absolute left-5 top-4 bottom-10 w-0.5 bg-neutral-800 -z-0"></div>
        )}

        {option.content.map((text, i) => (
          <div key={i} className="relative z-10">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isX ? 'bg-neutral-700' : 'bg-[#0a66c2] text-white'}`}>
                  {isX ? '🤖' : 'in'}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-baseline justify-between">
                  <div className="font-bold text-white mr-2">You <span className="text-neutral-500 font-normal">@{isX ? 'AI_Expert' : 'AI Expert'}</span></div>
                </div>
                <p className="text-neutral-200 mt-1 whitespace-pre-wrap text-[15px] leading-relaxed font-normal">
                  {text}
                </p>
                
                {/* Actions */}
                <div className={`flex gap-4 mt-3 border-t pt-2 ${isX ? 'border-neutral-800' : 'border-[#0a66c2]/20'}`}>
                   <button 
                    onClick={() => handlePost(text)}
                    className={`flex items-center gap-1 text-xs font-medium hover:opacity-80 ${isX ? 'text-blue-400' : 'text-[#0a66c2]'}`}
                   >
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        {isX ? (
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        ) : (
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        )}
                     </svg>
                     Post on {platform}
                   </button>
                   <button 
                    onClick={() => copyToClipboard(text)}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-neutral-300"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                     Copy
                   </button>
                   {isX && (
                    <span className={`text-xs ml-auto ${text.length > 280 ? 'text-red-500' : 'text-neutral-500'}`}>
                      {text.length} chars
                    </span>
                   )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCard;
