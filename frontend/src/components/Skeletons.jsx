import React from 'react';

export const VideoCardSkeleton = () => {
    return (
        <div className="glass rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full animate-pulse">
            <div className="relative aspect-video bg-slate-800/80"></div>
            <div className="p-5 flex-grow flex flex-col">
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-4"></div>
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5">
                    <div className="h-4 bg-slate-800 rounded w-16"></div>
                    <div className="h-4 bg-slate-800 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

export const UserRowSkeleton = () => {
    return (
        <tr className="border-b border-white/5 animate-pulse">
            <td className="p-4"><div className="h-5 bg-slate-800 rounded w-32"></div></td>
            <td className="p-4"><div className="h-5 bg-slate-800 rounded w-48"></div></td>
            <td className="p-4"><div className="h-6 bg-slate-800 rounded-lg w-20"></div></td>
            <td className="p-4 text-right"><div className="h-8 bg-slate-800 rounded-lg w-24 ml-auto"></div></td>
        </tr>
    );
};
