import React from 'react';
import { ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg-dark text-text-primary p-8 flex flex-col items-center justify-center text-center">
                     <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
                     <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                     <p className="text-text-secondary max-w-md mb-8">
                         The application encountered an unexpected error. Please try refreshing the page or navigating back home.
                     </p>
                     <button
                        onClick={() => window.location.href = '/'}
                        className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
                     >
                         Return to Dashboard
                     </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
