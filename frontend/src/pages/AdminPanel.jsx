import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, deleteVideo } from '../services/adminService';
import { getVideos } from '../services/videoService';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Video, Trash2, Edit2, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const RoleBadge = ({ role }) => {
    const colors = {
        viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        editor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border uppercase tracking-wider ${colors[role] || colors.viewer}`}>
            {role}
        </span>
    );
};

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'videos'
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch Lists
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: getUsers,
    });

    const { data: videos, isLoading: videosLoading } = useQuery({
        queryKey: ['adminVideos'],
        queryFn: () => getVideos('all'),
    });

    // Mutations
    const roleMutation = useMutation({
        mutationFn: ({ userId, role }) => updateUserRole(userId, role),
        onMutate: async (newInfo) => {
            await queryClient.cancelQueries(['adminUsers']);
            const previousUsers = queryClient.getQueryData(['adminUsers']);
            queryClient.setQueryData(['adminUsers'], old => 
                old.map(u => u._id === newInfo.userId ? { ...u, role: newInfo.role } : u)
            );
            return { previousUsers };
        },
        onError: (err, newInfo, context) => {
            queryClient.setQueryData(['adminUsers'], context.previousUsers);
            toast.error('Failed to update role');
        },
        onSettled: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast.success('Role updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVideo,
        onMutate: async (videoId) => {
            await queryClient.cancelQueries(['adminVideos']);
            const previousVideos = queryClient.getQueryData(['adminVideos']);
            queryClient.setQueryData(['adminVideos'], old => old.filter(v => v._id !== videoId));
            return { previousVideos };
        },
        onError: (err, videoId, context) => {
            queryClient.setQueryData(['adminVideos'], context.previousVideos);
            toast.error('Failed to delete video');
        },
        onSettled: () => {
             queryClient.invalidateQueries(['adminVideos']);
             toast.success('Video deleted permanently');
        }
    });

    const handleRoleChange = (userId, newRole) => {
        if(userId === user._id) {
             return toast.error("You cannot change your own admin role.");
        }
        roleMutation.mutate({ userId, role: newRole });
    };

    const handleDelete = (videoId) => {
        if (window.confirm('Are you absolutely sure you want to delete this video? This cannot be undone.')) {
             deleteMutation.mutate(videoId);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-4xl font-bold mb-2 flex items-center gap-3"
                            >
                                <Shield className="w-8 h-8 text-purple-500" /> Admin Panel
                            </motion.h2>
                            <p className="text-text-secondary">Manage users and oversee all organization videos.</p>
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-white/10 mb-8 pb-px">
                     <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors relative
                            ${activeTab === 'users' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                     >
                         <Users className="w-4 h-4" /> Users
                         {activeTab === 'users' && <motion.div layoutId="admintab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></motion.div>}
                     </button>
                     <button
                        onClick={() => setActiveTab('videos')}
                        className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors relative
                            ${activeTab === 'videos' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                     >
                         <Video className="w-4 h-4" /> All Videos
                         {activeTab === 'videos' && <motion.div layoutId="admintab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></motion.div>}
                     </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass rounded-3xl border border-white/5 overflow-hidden"
                    >
                        {activeTab === 'users' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/50 border-b border-white/5 text-slate-400 text-sm">
                                            <th className="p-4 font-medium">Name</th>
                                            <th className="p-4 font-medium">Email</th>
                                            <th className="p-4 font-medium">Role</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersLoading ? (
                                            <tr><td colSpan="4" className="p-12 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></td></tr>
                                        ) : users?.length === 0 ? (
                                            <tr><td colSpan="4" className="p-12 text-center text-slate-500">No users found.</td></tr>
                                        ) : (
                                            users?.map((u) => (
                                                <tr key={u._id} className="border-b border-white/5 bg-slate-900/20 hover:bg-slate-800/30 transition-colors group">
                                                    <td className="p-4 font-medium">{u.name} {user._id === u._id && '(You)'}</td>
                                                    <td className="p-4 text-text-secondary">{u.email}</td>
                                                    <td className="p-4"><RoleBadge role={u.role} /></td>
                                                    <td className="p-4 text-right">
                                                         <select
                                                            disabled={u._id === user._id}
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                            className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                                                        >
                                                            <option value="viewer">Viewer</option>
                                                            <option value="editor">Editor</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/50 border-b border-white/5 text-slate-400 text-sm">
                                            <th className="p-4 font-medium">Video Title</th>
                                            <th className="p-4 font-medium">Owner ID</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videosLoading ? (
                                            <tr><td colSpan="4" className="p-12 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></td></tr>
                                        ) : videos?.length === 0 ? (
                                            <tr><td colSpan="4" className="p-12 text-center text-slate-500">No videos in organization.</td></tr>
                                        ) : (
                                            videos?.map((v) => (
                                                <tr key={v._id} className="border-b border-white/5 bg-slate-900/20 hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4 font-medium max-w-xs truncate">{v.title}</td>
                                                    <td className="p-4 text-text-secondary text-sm font-mono">{v.ownerId}</td>
                                                    <td className="p-4"><StatusBadge status={v.status} /></td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => handleDelete(v._id)}
                                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Delete Video"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPanel;
