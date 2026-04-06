import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, FileVideo, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadVideo } from '../services/videoService';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UploadVideo = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Only connect socket if we had a successful upload, otherwise we don't necessarily need it here yet
        let socket;
        if (status === 'success') {
            socket = io(API_URL);
            socket.on('upload:complete', (data) => {
                console.log('Server processed upload:', data);
                toast.success('Video processed successfully!');
                navigate('/dashboard');
            });
        }
        return () => {
            if (socket) socket.disconnect();
        };
    }, [status, navigate]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const validateFile = (selectedFile) => {
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error('Invalid file type. Please upload MP4, MOV, AVI, or MKV.');
            return false;
        }
        if (selectedFile.size > 500 * 1024 * 1024) {
            toast.error('File is too large. Maximum size is 500MB.');
            return false;
        }
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
            if (!title) setTitle(droppedFile.name.split('.')[0]);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            if (!title) setTitle(selectedFile.name.split('.')[0]);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a video to upload');
        if (!title.trim()) return toast.error('Title is required');

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            setStatus('uploading');
            setProgress(0);
            
            await uploadVideo(formData, (percent) => {
                setProgress(percent);
            });

            setStatus('success');
            toast.success('Upload complete! Finishing up...');
            
            // Allow time for the toast and socket event to fire before redirect
            setTimeout(() => {
                if (status !== 'error') {
                   navigate('/dashboard');
                }
            }, 3000);

        } catch (error) {
            setStatus('error');
            toast.error(error.response?.data?.message || 'Failed to upload video');
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Upload Video</h1>
                        <p className="text-text-secondary mt-2">Publish a new video to your vault.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                </header>

                <div className="glass rounded-2xl p-8 border border-white/5">
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                                ${isDragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                                className="hidden"
                            />
                            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 text-primary/80" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Drop video here or click to browse</h3>
                            <p className="text-text-secondary text-sm">
                                Supported formats: MP4, MOV, AVI, MKV (Max 500MB)
                            </p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800/50 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-8"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <FileVideo className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium truncate max-w-xs">{file.name}</p>
                                    <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setFile(null); setStatus('idle'); setProgress(0); }}
                                disabled={status === 'uploading'}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-red-400" />
                            </button>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">Title *</label>
                            <input
                                type="text"
                                required
                                disabled={status === 'uploading'}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                placeholder="Enter video title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">Description</label>
                            <textarea
                                disabled={status === 'uploading'}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Describe your video..."
                            ></textarea>
                        </div>

                        {status === 'uploading' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary font-medium">Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!file || status === 'uploading' || status === 'success'}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {status === 'idle' && <Upload className="w-5 h-5" />}
                            {status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin" />}
                            {status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                            {status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                            
                            {status === 'idle' && 'Upload Video'}
                            {status === 'uploading' && `Uploading (${progress}%)`}
                            {status === 'success' && 'Upload Complete'}
                            {status === 'error' && 'Retry Upload'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadVideo;
