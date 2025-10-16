import React, { useState, useCallback } from 'react';
import type { Highlight } from '../types';

interface HighlightCardProps {
  highlight: Highlight;
  vodUrl: string;
  onStartEdit: (highlight: Highlight) => void;
  onFeedback: (description: string, feedback: 'liked' | 'disliked') => void;
}

const ClockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const ShareIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
  </svg>
);

const ClipIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const EnhanceIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.046A7.947 7.947 0 0119 11h1.046a1 1 0 01.884 1.488l-3.268 5.446a1 1 0 01-1.488.112l-1.47-1.47a1 1 0 010-1.414l1.47-1.47-1.04-1.734a1 1 0 01.112-1.488l3.268-1.96a1 1 0 01.52-.068 7.947 7.947 0 01-5.908 5.908 1 1 0 01-.068.52l-1.96 3.268a1 1 0 01-1.488.112L10 16.03l-1.47 1.47a1 1 0 01-1.414 0l-1.47-1.47a1 1 0 01-.112-1.488l1.734-1.04-1.47-1.47a1 1 0 01-1.414 0l-1.47 1.47a1 1 0 01-1.488-.112L.512 12.488A1 1 0 012 11h1.046A7.947 7.947 0 0111 3.046V2a1 1 0 01.954-.988 10.005 10.005 0 01-.654.034zM11 5.046a5.947 5.947 0 00-5.908 5.908A5.947 5.947 0 0011 16.862a5.947 5.947 0 005.908-5.908A5.947 5.947 0 0011 5.046z" clipRule="evenodd" />
    </svg>
);

const ThumbsUpIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.758a1 1 0 00.97-1.226l-1.25-4.375a1 1 0 01.97-1.226H17a1 1 0 001-1v-2a1 1 0 00-1-1h-2.121l.942-3.14a1 1 0 00-1.912-.573l-3.358 6.716a1 1 0 01-.97 1.226H6z" />
    </svg>
);

const ThumbsDownIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.242a1 1 0 00-.97 1.226l1.25 4.375a1 1 0 01-.97 1.226H3a1 1 0 00-1 1v2a1 1 0 001 1h2.121l-.942 3.14a1 1 0 001.912.573l3.358-6.716a1 1 0 01.97-1.226H14z" />
    </svg>
);

const formatTimestampForUrl = (timestamp: string): string => {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return `${h}h${m}m${s}s`;
  }
  return '0s'; // Fallback
};

export const HighlightCard: React.FC<HighlightCardProps> = ({ highlight, vodUrl, onStartEdit, onFeedback }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showClipHelper, setShowClipHelper] = useState(false);
  const highlightUrl = `${vodUrl}?t=${formatTimestampForUrl(highlight.timestamp)}`;

  const handleShare = useCallback(async () => {
    const shareText = `Check out this highlight from the stream: "${highlight.title}"!\n\n${highlight.description}\n\nWatch it here: ${highlightUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Twitch VOD Highlight: ${highlight.title}`,
          text: `Check out this cool moment: "${highlight.title}"`,
          url: highlightUrl,
        });
      } catch (error) {
        console.error('Error using Web Share API:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy text to clipboard: ', err);
        alert('Failed to copy link to clipboard.');
      }
    }
  }, [highlight.title, highlight.description, highlightUrl]);
  
  const handleCreateClip = useCallback(() => {
    window.open(highlightUrl, '_blank');
    setShowClipHelper(true);
    setTimeout(() => {
        setShowClipHelper(false);
    }, 5000);
  }, [highlightUrl]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-lg transition-transform hover:scale-105 hover:border-purple-500/50 duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
        <h3 className="text-xl font-bold text-purple-300">{highlight.title}</h3>
        <div className="flex items-center text-sm font-mono bg-slate-700 text-slate-300 px-3 py-1 rounded-full mt-2 sm:mt-0">
          <ClockIcon />
          {highlight.timestamp}
        </div>
      </div>
      <p className="text-slate-400 mb-4">{highlight.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center flex-wrap gap-3">
          <a
            href={highlightUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-slate-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-500 transition duration-200 text-sm"
          >
            Go to Clip →
          </a>
          <button
            onClick={handleShare}
            title="Share Highlight"
            disabled={isCopied}
            className={`inline-flex items-center justify-center w-28 bg-slate-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-500 transition-colors duration-200 text-sm disabled:cursor-default ${
              isCopied ? 'bg-green-600 hover:bg-green-600' : ''
            }`}
          >
            {isCopied ? (
              'Copied!'
            ) : (
              <>
                <ShareIcon />
                <span className="ml-2">Share</span>
              </>
            )}
          </button>
          <button
            onClick={handleCreateClip}
            title="Create a clip on Twitch"
            className="inline-flex items-center justify-center bg-slate-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-500 transition duration-200 text-sm"
          >
              <ClipIcon />
              <span className="ml-2">Create Clip</span>
          </button>
          <button
            onClick={() => onStartEdit(highlight)}
            title="Enhance and Record Clip"
            className="inline-flex items-center justify-center bg-pink-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-700 transition duration-200 text-sm"
          >
              <EnhanceIcon />
              <span className="ml-2">Enhance</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onFeedback(highlight.description, 'liked')}
                title="Good highlight"
                className={`p-2 rounded-full transition-colors duration-200 ${
                    highlight.feedback === 'liked' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'text-slate-400 hover:bg-slate-700'
                }`}
            >
                <ThumbsUpIcon />
            </button>
            <button
                onClick={() => onFeedback(highlight.description, 'disliked')}
                title="Bad highlight"
                className={`p-2 rounded-full transition-colors duration-200 ${
                    highlight.feedback === 'disliked' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'text-slate-400 hover:bg-slate-700'
                }`}
            >
                <ThumbsDownIcon />
            </button>
        </div>
      </div>

       {showClipHelper && (
        <p className="text-xs text-slate-400 mt-3 animate-pulse">
            VOD opened! Now click the Clip icon (✂️) on Twitch to finalize.
        </p>
      )}
    </div>
  );
};