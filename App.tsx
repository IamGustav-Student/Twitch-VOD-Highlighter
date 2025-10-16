import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { HighlightCard } from './components/HighlightCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { ClipEditorModal } from './components/ClipEditorModal';
import { findVODHighlights } from './services/geminiService';
import type { Highlight } from './types';

const App: React.FC = () => {
  const [vodUrl, setVodUrl] = useState<string>('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  const [likedHighlights, setLikedHighlights] = useState<string[]>([]);
  const [dislikedHighlights, setDislikedHighlights] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedLiked = localStorage.getItem('likedHighlights');
      const storedDisliked = localStorage.getItem('dislikedHighlights');
      if (storedLiked) setLikedHighlights(JSON.parse(storedLiked));
      if (storedDisliked) setDislikedHighlights(JSON.parse(storedDisliked));
    } catch (e) {
      console.error("Failed to parse feedback from local storage", e);
    }
  }, []);
  
  const handleFeedback = useCallback((highlightDescription: string, feedback: 'liked' | 'disliked') => {
    setHighlights(prev => prev.map(h => 
      h.description === highlightDescription 
        ? { ...h, feedback: h.feedback === feedback ? undefined : feedback } 
        : h
    ));

    const updatePreferences = (currentStatus?: 'liked' | 'disliked') => {
      let newLiked = [...likedHighlights];
      let newDisliked = [...dislikedHighlights];

      // Remove from both lists first
      newLiked = newLiked.filter(d => d !== highlightDescription);
      newDisliked = newDisliked.filter(d => d !== highlightDescription);

      // Add to the correct list if it's a new selection
      if (currentStatus !== feedback) {
        if (feedback === 'liked') newLiked.push(highlightDescription);
        if (feedback === 'disliked') newDisliked.push(highlightDescription);
      }

      setLikedHighlights(newLiked);
      setDislikedHighlights(newDisliked);
      localStorage.setItem('likedHighlights', JSON.stringify(newLiked));
      localStorage.setItem('dislikedHighlights', JSON.stringify(newDisliked));
    };
    
    const currentHighlight = highlights.find(h => h.description === highlightDescription);
    updatePreferences(currentHighlight?.feedback);
  }, [highlights, likedHighlights, dislikedHighlights]);


  const handleFindHighlights = useCallback(async (url: string, query: string) => {
    if (!url) {
      setError('Please enter a valid Twitch VOD URL.');
      return;
    }
    
    const twitchRegex = /^(https?:\/\/)?(www\.)?twitch\.tv\/videos\/\d+$/;
    if (!twitchRegex.test(url)) {
      setError('Invalid Twitch VOD URL format. It should look like: https://www.twitch.tv/videos/123456789');
      return;
    }

    setVodUrl(url);
    setIsLoading(true);
    setError(null);
    setHighlights([]);
    setEditingHighlight(null);

    try {
      const results = await findVODHighlights(url, query, likedHighlights, dislikedHighlights);
      const resultsWithFeedback = results.map(h => ({
        ...h,
        feedback: likedHighlights.includes(h.description) 
          ? 'liked' 
          : dislikedHighlights.includes(h.description) 
          ? 'disliked'
          : undefined
      }));
      setHighlights(resultsWithFeedback);
    } catch (e) {
      console.error(e);
      setError('Failed to generate highlights. The AI service may be unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [likedHighlights, dislikedHighlights]);

  const handleStartEditing = (highlight: Highlight) => {
    setEditingHighlight(highlight);
  };

  const handleStopEditing = () => {
    setEditingHighlight(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        
        <main>
          <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">
            Enter a Twitch VOD URL to get AI-generated highlights. You can specify what to look for, or let the AI find general-purpose key moments.
          </p>

          <UrlInputForm onSubmit={handleFindHighlights} isLoading={isLoading} />
          
          {error && <ErrorMessage message={error} />}

          <div className="mt-12">
            {isLoading && <LoadingSpinner />}
            
            {highlights.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">Generated Highlights</h2>
                {highlights.map((highlight, index) => (
                  <HighlightCard 
                    key={index} 
                    highlight={highlight} 
                    vodUrl={vodUrl}
                    onStartEdit={handleStartEditing}
                    onFeedback={handleFeedback}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
        
        {editingHighlight && (
          <ClipEditorModal 
            highlight={editingHighlight}
            vodUrl={vodUrl}
            onClose={handleStopEditing}
          />
        )}
      </div>
    </div>
  );
};

export default App;