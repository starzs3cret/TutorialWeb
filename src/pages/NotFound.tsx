import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Terminal } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>404 — DevTutorials.io</title>
            </Helmet>

            <div className="flex flex-col items-center justify-center min-h-screen bg-canvas text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Terminal size={32} className="text-primary/50" />
                </div>
                <h1 className="text-6xl font-bold text-fg-primary mb-2">404</h1>
                <p className="text-fg-muted mb-8">This page doesn't exist. Maybe it was deleted, or the URL is wrong.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-primary text-primary-fg rounded-xl text-sm font-medium
            hover:bg-primary-hover shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                    Go Home
                </button>
            </div>
        </>
    );
};

export default NotFound;
