
import React from 'react';

const TwitchIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-12 h-12 text-purple-500"
    aria-hidden="true"
  >
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.857 0h1.714v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z" />
  </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-10">
      <div className="flex justify-center items-center gap-4 mb-4">
        <TwitchIcon />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          VOD Highlighter
        </h1>
      </div>
    </header>
  );
};
