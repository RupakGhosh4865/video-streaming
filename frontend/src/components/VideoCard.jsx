import { motion } from 'framer-motion';
import { Video, HardDrive, Calendar, PlayCircle, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleCopyLink = () => {
        const streamUrl = `${API_URL}/api/videos/${video._id}/stream?token=${localStorage.getItem('token')}`;
        navigator.clipboard.writeText(streamUrl);
        toast.success('Stream link copied to clipboard!');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full"
        >
            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-slate-800/50 flex items-center justify-center overflow-hidden">
                {video.thumbnails && video.thumbnails.length > 0 && video.thumbnails[0] ? (
                    <img 
                        src={video.thumbnails[0].startsWith('http') ? video.thumbnails[0] : `${API_URL}${video.thumbnails[0]}`} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                
                {/* Fallback pattern */}
                <div className={`absolute inset-0 flex items-center justify-center bg-slate-800/80 ${(video.thumbnails && video.thumbnails.length > 0) ? 'hidden' : 'flex'}`}>
                     <Video className="w-12 h-12 text-white/20" />
                </div>

                <div className="absolute top-3 right-3">
                    <StatusBadge status={video.status} />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-semibold text-lg mb-1 truncate" title={video.title}>
                    {video.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs text-text-secondary mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{formatFileSize(video.size)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(video.uploadedAt)}</span>
                    </div>
                </div>

                {/* Processing Progress Bar */}
                {video.status === 'processing' && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-blue-400 font-medium truncate pr-2">
                                {video.processingStep || 'Processing...'}
                            </span>
                            <span className="text-blue-400 font-bold">{video.processingProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${video.processingProgress || 0}%` }}
                                className="bg-blue-500 h-full rounded-full relative overflow-hidden"
                            >
                                {/* Animated shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center gap-3 w-full">
                    <button 
                        onClick={() => navigate(`/video/${video._id}`)}
                        disabled={video.status !== 'safe'}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all
                            ${video.status === 'safe' 
                                ? 'bg-primary hover:bg-primary-dark text-white' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`
                        }
                    >
                        <PlayCircle className="w-4 h-4" /> Watch
                    </button>
                    
                    {user?.role !== 'viewer' && video.status === 'safe' && (
                        <button 
                            onClick={handleCopyLink}
                            title="Copy Stream Link"
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-lg transition-colors text-text-secondary hover:text-white"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default VideoCard;
