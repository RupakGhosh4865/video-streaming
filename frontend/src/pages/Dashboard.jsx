import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogOut, User, Shield, Video, UploadCloud, Loader2, Search, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { getVideos } from '../services/videoService';
import { useSocket } from '../hooks/useSocket';
import { useRole } from '../hooks/useRole';
import VideoCard from '../components/VideoCard';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { isViewer, isAdmin } = useRole();
    const navigate = useNavigate();
    
    // Connect to socket with token
    const token = localStorage.getItem('token');
    const { on, off } = useSocket(token);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const data = await getVideos(statusFilter);
                setVideos(data);
            } catch (error) {
                toast.error('Failed to load videos');
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [statusFilter]);

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
                v._id === data.videoId ? { ...v, status: data.status, processingProgress: 100 } : v
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

    // Background polling fallback — syncs videos from DB if any are currently processing
    useEffect(() => {
        const hasProcessing = videos.some(v => v.status === 'processing');
        if (!hasProcessing) return;

        const interval = setInterval(async () => {
            try {
                const data = await getVideos(statusFilter);
                // Update local state if DB state has changed (e.g. status safe/100%)
                setVideos(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
            } catch (err) {
                console.error('Processing sync failed:', err);
            }
        }, 10000); // 10s sync

        return () => clearInterval(interval);
    }, [videos, statusFilter]);

    // Prepare Filtered List internally for rendering
    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-purple-400 transition-colors"
                            title="Admin Panel"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-semibold">Admin</span>
                        </button>
                    )}
                    
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
                    
                    {!isViewer && (
                        <button
                            onClick={() => navigate('/upload')}
                            className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                        >
                            <UploadCloud className="w-5 h-5" />
                            Upload Video
                        </button>
                    )}
                </header>

                {/* Filters and Search */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 border border-white/5 p-2 rounded-2xl">
                    {/* Status Tabs */}
                    <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto scroolbar-hide">
                        {['all', 'safe', 'flagged', 'processing'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap
                                    ${statusFilter === status 
                                        ? 'bg-slate-800 text-white shadow-sm' 
                                        : 'text-text-secondary hover:text-white hover:bg-white/5'}`
                                }
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input 
                            type="text" 
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

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
                        {!isViewer && (
                             <button
                                onClick={() => navigate('/upload')}
                                className="bg-primary hover:bg-primary-dark px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <UploadCloud className="w-5 h-5" />
                                Upload Video
                            </button>
                        )}
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="glass rounded-3xl p-12 border border-white/5 flex flex-col items-center justify-center text-center flex-grow mt-4">
                        <div className="bg-white/5 p-6 rounded-full mb-6 relative">
                             <Search className="w-12 h-12 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                             <Video className="w-12 h-12 text-primary/10" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No results found</h3>
                        <p className="text-text-secondary max-w-sm mb-4">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                        {(searchQuery || statusFilter !== 'all') && (
                            <button
                                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                                className="text-primary hover:text-primary-dark font-medium transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
