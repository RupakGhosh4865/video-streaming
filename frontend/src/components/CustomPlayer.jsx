import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';

const CustomPlayer = ({ src, poster }) => {
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');
    const [isMuted, setIsMuted] = useState(false);
    const [isWaiting, setIsWaiting] = useState(true);

    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const fullDuration = videoRef.current.duration;
            setCurrentTime(formatTime(current));
            setProgress((current / fullDuration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(formatTime(videoRef.current.duration));
            setIsWaiting(false);
        }
    };

    const handleSeek = (e) => {
        const seekPosition = e.target.value;
        if (videoRef.current) {
            videoRef.current.currentTime = (seekPosition / 100) * videoRef.current.duration;
            setProgress(seekPosition);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullScreen = () => {
        if (playerContainerRef.current) {
            if (!document.fullscreenElement) {
                playerContainerRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying]);

    return (
        <div ref={playerContainerRef} className="relative group bg-black w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {isWaiting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            )}
            
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsWaiting(true)}
                onPlaying={() => setIsWaiting(false)}
                onCanPlay={() => setIsWaiting(false)}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div className="w-full flex items-center mb-4 group/slider cursor-pointer h-2 relative">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="w-full bg-white/20 h-1.5 rounded-full z-0">
                        <div 
                            className="bg-primary h-full rounded-full relative pointer-events-none" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/slider:scale-100 transition-transform"></div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-primary transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        
                        <div className="flex items-center gap-2 group/volume">
                             <button onClick={toggleMute} className="hover:text-primary transition-colors">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            {/* Simple volume slider could go here, omitting for brevity of custom player scaffold */}
                        </div>

                        <div className="text-sm font-medium tracking-wide">
                            {currentTime} <span className="text-white/50 mx-1">/</span> {duration}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleFullScreen} className="hover:text-primary transition-colors">
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPlayer;
