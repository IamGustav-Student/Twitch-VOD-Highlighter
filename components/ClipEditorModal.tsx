import React, { useState, useEffect, useRef } from 'react';
import type { Highlight } from '../types';

declare const Twitch: any;

interface ClipEditorModalProps {
  highlight: Highlight;
  vodUrl: string;
  onClose: () => void;
}

const timestampToSeconds = (timestamp: string): number => {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

// Use stable, direct-link audio files from reliable CDNs
const SOUND_EFFECTS = [
    { name: 'Vine Boom', src: 'https://cdn.jsdelivr.net/gh/Nato-V/Files/vine-boom.mp3' },
    { name: 'Sad Trombone', src: 'https://cdn.jsdelivr.net/gh/Nato-V/Files/sad-trombone.mp3' },
    { name: 'Air Horn', src: 'https://cdn.jsdelivr.net/gh/Nato-V/Files/mlg-airhorn.mp3' },
];

const MUSIC_TRACKS = [
    { name: 'Epic Action', src: 'https://cdn.pixabay.com/download/audio/2022/10/26/audio_58403337f7.mp3' },
    { name: 'Chill Lofi', src: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_8b27210092.mp3' },
    { name: 'Funny', src: 'https://cdn.pixabay.com/download/audio/2022/06/14/audio_3ef09a5525.mp3' },
];


export const ClipEditorModal: React.FC<ClipEditorModalProps> = ({ highlight, vodUrl, onClose }) => {
  const [textOverlay, setTextOverlay] = useState('Your Text Here');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const playerRef = useRef<any>(null); // Ref to hold the Twitch Player instance
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activeMusicSrc, setActiveMusicSrc] = useState<string | null>(null);
  const [activeSfxSrc, setActiveSfxSrc] = useState<string | null>(null);

  // Effect to initialize and clean up audio players once
  useEffect(() => {
    musicAudioRef.current = new Audio();
    musicAudioRef.current.loop = true;
    sfxAudioRef.current = new Audio();

    return () => {
        if (musicAudioRef.current) {
            musicAudioRef.current.pause();
            musicAudioRef.current = null;
        }
        if (sfxAudioRef.current) {
            sfxAudioRef.current.pause();
            sfxAudioRef.current = null;
        }
    }
  }, []);

  useEffect(() => {
    const videoId = vodUrl.split('/').pop();
    if (!videoId) return;

    const embedDiv = document.getElementById('twitch-embed');
    if (embedDiv) {
      embedDiv.innerHTML = ''; // Clear previous player instance if any
    }

    const player = new Twitch.Player('twitch-embed', {
      video: videoId,
      width: '100%',
      height: '100%',
      parent: [window.location.hostname],
      autoplay: false,
    });
    playerRef.current = player;

    player.addEventListener(Twitch.Player.READY, () => {
        const startTime = timestampToSeconds(highlight.timestamp) - 15;
        player.seek(startTime > 0 ? startTime : 0);
        player.setVolume(0.5);
    });

    return () => {
      playerRef.current = null;
    };
  }, [highlight, vodUrl]);

  const handlePlaySfx = (src: string) => {
    if (sfxAudioRef.current) {
      sfxAudioRef.current.src = src;
      sfxAudioRef.current.play().catch(e => console.error("SFX playback error:", e));
      setActiveSfxSrc(src);
      setTimeout(() => setActiveSfxSrc(null), 500); // Visual indicator lasts for 500ms
    }
  };

  const handlePlayMusic = (src: string) => {
    if (musicAudioRef.current) {
      if (musicAudioRef.current.src !== src || musicAudioRef.current.paused) {
        musicAudioRef.current.src = src;
        musicAudioRef.current.play().catch(e => console.error("Music playback error:", e));
        setActiveMusicSrc(src);
      }
    }
  };
  
  const handleStopMusic = () => {
     if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        setActiveMusicSrc(null);
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setIsRecording(true);
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `highlight-${highlight.title.replace(/\s/g, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setIsRecording(false);
      };

      stream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
      };
      
      recorder.start();
      
      if (playerRef.current) {
        playerRef.current.play();
      }

    } catch (err) {
      console.error("Error starting screen recording:", err);
      alert("Could not start screen recording. Please grant permissions and try again.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsRecording(false);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTextPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="w-full max-w-6xl h-[90vh] bg-slate-900 rounded-lg shadow-2xl flex flex-col p-4 gap-4">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-purple-400">Clip Enhancer</h2>
          <button onClick={onClose} className="text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center">&times;</button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex gap-4 overflow-hidden">
          {/* Video Player Area */}
          <div className="flex-grow w-3/4 relative bg-black">
            <div id="twitch-embed" className="w-full h-full"></div>
            <div
              className="absolute text-white font-bold text-4xl p-2 rounded cursor-move select-none"
              style={{ 
                  left: `${textPosition.x}px`, 
                  top: `${textPosition.y}px`, 
                  textShadow: '2px 2px 4px #000000',
                  userSelect: 'none'
              }}
              onMouseDown={handleMouseDown}
            >
              {textOverlay}
            </div>
          </div>

          {/* Controls Area */}
          <div className="w-1/4 flex flex-col gap-4 overflow-y-auto p-2 bg-slate-800 rounded-lg">
            <div>
              <h3 className="font-bold mb-2 text-pink-400">Record Clip</h3>
              {!isRecording ? (
                <button onClick={handleStartRecording} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">Start Recording</button>
              ) : (
                <button onClick={handleStopRecording} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors animate-pulse">Stop Recording</button>
              )}
              <p className="text-xs text-slate-400 mt-2">Record the player and your effects to a new video file.</p>
            </div>
          
            <div>
              <label className="font-bold mb-2 text-pink-400 block">Text Overlay</label>
              <input
                type="text"
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
            </div>
            
            <div>
              <h3 className="font-bold mb-2 text-pink-400">Sound Effects</h3>
              <div className="grid grid-cols-2 gap-2">
                {SOUND_EFFECTS.map(sfx => (
                  <button 
                    key={sfx.name} 
                    onClick={() => handlePlaySfx(sfx.src)} 
                    className={`bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm transition-all duration-150 ${
                      activeSfxSrc === sfx.src ? 'ring-2 ring-pink-400 scale-105' : ''
                    }`}
                  >
                    {sfx.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-pink-400">Background Music</h3>
              <div className="flex flex-col gap-2">
                {MUSIC_TRACKS.map(track => (
                  <button 
                    key={track.name} 
                    onClick={() => handlePlayMusic(track.src)} 
                    className={`bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm text-left transition-all duration-150 ${
                      activeMusicSrc === track.src ? 'bg-purple-600 font-bold' : ''
                    }`}
                  >
                    {track.name}
                  </button>
                ))}
                 <button onClick={handleStopMusic} className="bg-red-800 hover:bg-red-700 p-2 rounded text-sm">Stop Music</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};