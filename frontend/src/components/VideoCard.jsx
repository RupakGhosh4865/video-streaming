import React from 'react';
import { motion } from 'framer-motion';
import { Video, HardDrive, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VideoCard = ({ video }) => {

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full"
        >
            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-slate-800/50 flex items-center justify-center overflow-hidden">
                {video.thumbnails && video.thumbnails.length > 0 ? (
                    <img 
                        src={`${API_URL}${video.thumbnails[0]}`} 
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
            </div>
        </motion.div>
    );
};

export default VideoCard;
