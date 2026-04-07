import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar, HardDrive, ShieldAlert, FileVideo } from 'lucide-react';
import { getVideoById } from '../services/videoService';
import CustomPlayer from '../components/CustomPlayer';
import StatusBadge from '../components/StatusBadge';



const VideoPlayerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    


    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const data = await getVideoById(id);
                setVideo(data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) {
                    setError('Video not found.');
                } else if (err.response?.status === 403) {
                    setError('You do not have permission to view this video.');
                } else {
                    setError('Failed to load video data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-dark flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-bg-dark text-text-primary p-8 flex flex-col items-center justify-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-text-secondary mb-8">{error}</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Library
                </button>
            </div>
        );
    }

    // Use Cloudinary URL directly — no backend proxy needed
    const streamUrl = video.streamUrl || '';
    const posterUrl = video.thumbnails && video.thumbnails.length > 0 ? video.thumbnails[0] : null;

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Navigation */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="group mb-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
                >
                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Library</span>
                </button>

                {/* Player constraints */}
                <div className="mb-8 relative">
                    {video.status === 'flagged' ? (
                         <div className="w-full aspect-video bg-red-950/30 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center text-center p-8 shadow-inner">
                            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-red-400 mb-2">Video Flagged for Sensitivity</h2>
                            <p className="text-red-300/80 max-w-md">
                                This video violates community guidelines or failed the automated sensitivity check. Playback has been disabled.
                            </p>
                         </div>
                    ) : video.status === 'processing' || video.status === 'pending' ? (
                        <div className="w-full aspect-video bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                            <h2 className="text-xl font-bold mb-2">Video is Processing</h2>
                            <p className="text-text-secondary">
                                Please check back later when processing finishes to stream this video.
                            </p>
                         </div>
                    ) : !streamUrl ? (
                        <div className="w-full aspect-video bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                            <FileVideo className="w-12 h-12 text-slate-500 mb-4" />
                            <h2 className="text-xl font-bold mb-2">No Video File Available</h2>
                            <p className="text-text-secondary max-w-sm">
                                This is a demo record with no actual video file. Please upload a real video through the Upload page to stream it here.
                            </p>
                        </div>
                    ) : (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <CustomPlayer src={streamUrl} poster={posterUrl} />
                         </motion.div>
                    )}
                </div>

                {/* Video Metadata */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 md:p-8 border border-white/5"
                >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Calendar className="w-4 h-4" /> {formatDate(video.uploadedAt)}
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">
                                    <HardDrive className="w-4 h-4" /> {formatFileSize(video.size)}
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">
                                    <FileVideo className="w-4 h-4" /> {video.resolution || 'Unknown Res'}
                                </span>
                                <StatusBadge status={video.status} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {video.description || 'No description provided.'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VideoPlayerPage;
