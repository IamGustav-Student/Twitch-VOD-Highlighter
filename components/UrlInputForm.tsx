import React, { useState } from 'react';

interface UrlInputFormProps {
  onSubmit: (url: string, query: string) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url, query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.twitch.tv/videos/..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 placeholder-slate-500"
          disabled={isLoading}
          aria-label="Twitch VOD URL"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex-shrink-0 flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed transition duration-200"
        >
          {isLoading ? 'Analyzing...' : 'Find Highlights'}
        </button>
      </div>
      <div className="w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Optional: e.g., "funny moments, intense clutches, jump scares..."'
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 placeholder-slate-500"
          disabled={isLoading}
          aria-label="Custom highlight query"
        />
      </div>
    </form>
  );
};