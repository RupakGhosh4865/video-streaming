import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useRole } from './hooks/useRole';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadVideo from './pages/UploadVideo';
import VideoPlayer from './pages/VideoPlayer';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: true,
        },
    },
});

const PrivateRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const { role } = useRole();

    if (loading) return <div className="min-h-screen bg-bg-dark flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const AppContent = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
                path="/dashboard" 
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/upload" 
                element={
                    <PrivateRoute>
                        <UploadVideo />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/video/:id" 
                element={
                    <PrivateRoute>
                        <VideoPlayer />
                    </PrivateRoute>
                } 
            />
            <Route
                path="/admin"
                element={
                    <PrivateRoute requiredRole="admin">
                        <AdminPanel />
                    </PrivateRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-bg-dark font-sans selection:bg-primary/30">
                        <AppContent />
                        <Toaster position="top-right" toastOptions={{ className: 'dark-toast' }} />
                    </div>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
