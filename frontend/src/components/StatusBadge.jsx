import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'pending':
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-semibold border border-slate-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                </div>
            );
        case 'processing':
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing</span>
                </div>
            );
        case 'safe':
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Safe</span>
                </div>
            );
        case 'flagged':
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Flagged</span>
                </div>
            );
        default:
            return null;
    }
};

export default StatusBadge;
