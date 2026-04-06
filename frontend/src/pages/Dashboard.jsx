import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogOut, User, Shield, Video, UploadCloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getVideos } from '../services/videoService';
import { useSocket } from '../hooks/useSocket';
import VideoCard from '../components/VideoCard';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Connect to socket with token
    const token = localStorage.getItem('token');
    const { on, off } = useSocket(token);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await getVideos();
                setVideos(data);
            } catch (error) {
                toast.error('Failed to load videos');
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    useEffect(() => {
        // Handle incoming processing events
        
        const handleStart = (data) => {
            setVideos(prev => prev.map(v => 
                v._id === data.videoId 
                    ? { ...v, status: 'processing', processingProgress: data.progress, processingStep: data.step } 
                    : v
            ));
        };

        const handleProgress = (data) => {
            setVideos(prev => prev.map(v => 
                v._id === data.videoId 
                    ? { ...v, processingProgress: data.progress, processingStep: data.step } 
                    : v
            ));
        };

        const handleComplete = (data) => {
            if (data.status === 'error') {
                 toast.error(`Video processing failed: ${data.error}`);
            } else {
                 toast.success('A video has finished processing!');
            }
            
            setVideos(prev => prev.map(v => 
                v._id === data.videoId 
                    ? { ...data.video } // replace with updated video data from server
                    : v
            ));
        };

        on('processing:start', handleStart);
        on('processing:progress', handleProgress);
        on('processing:complete', handleComplete);

        return () => {
            off('processing:start', handleStart);
            off('processing:progress', handleProgress);
            off('processing:complete', handleComplete);
        };
    }, [on, off]);

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col">
            {/* Navigation */}
            <nav className="glass border-b border-white/10 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded-lg">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold gradient-text">VideoVault</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-white/5 rounded-lg text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8 max-w-7xl mx-auto w-full flex-grow flex flex-col">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold mb-2"
                        >
                            Your Vault
                        </motion.h2>
                        <p className="text-text-secondary">Manage and monitor your video content.</p>
                    </div>
                    
                    {user?.role !== 'viewer' && (
                        <button
                            onClick={() => navigate('/upload')}
                            className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                        >
                            <UploadCloud className="w-5 h-5" />
                            Upload Video
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="flex items-center justify-center flex-grow">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className="glass rounded-3xl p-12 border border-white/5 flex flex-col items-center justify-center text-center flex-grow">
                        <div className="bg-white/5 p-6 rounded-full mb-6">
                            <Video className="w-12 h-12 text-primary/40" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">No Videos Yet</h3>
                        <p className="text-text-secondary max-w-sm mb-8">
                            Get started by uploading your first video.
                        </p>
                        {user?.role !== 'viewer' && (
                             <button
                                onClick={() => navigate('/upload')}
                                className="bg-primary hover:bg-primary-dark px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <UploadCloud className="w-5 h-5" />
                                Upload Video
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
