import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    BookOpen,
    ChevronRight,
    ArrowRight,
    ArrowLeft,
    LogIn,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { FileNode } from '@/types';

interface HeaderProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    activeFile: FileNode | null;
    currentIndex: number;
    totalFiles: number;
    completedCount: number;
    onNavigate: (direction: 'prev' | 'next') => void;
}

const Header: React.FC<HeaderProps> = ({
    isSidebarOpen,
    onToggleSidebar,
    activeFile,
    currentIndex,
    totalFiles,
    completedCount,
    onNavigate,
}) => {
    const navigate = useNavigate();
    const { user, logOut } = useAuth();

    return (
        <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                    aria-label="Toggle sidebar"
                >
                    {isSidebarOpen ? <Menu size={18} /> : <BookOpen size={18} />}
                </button>
                {activeFile && (
                    <nav className="hidden sm:flex text-sm text-slate-500 items-center gap-1.5">
                        <span>Course</span>
                        <ChevronRight size={12} className="text-slate-600" />
                        <span className="text-slate-200 font-medium truncate max-w-[240px]">
                            {activeFile.name}
                        </span>
                    </nav>
                )}
            </div>

            <div className="flex items-center gap-1.5">
                {totalFiles > 0 && (
                    <>
                        <span className="text-xs text-slate-500 mr-2 hidden sm:inline tabular-nums">
                            {completedCount}/{totalFiles} completed
                        </span>
                        <div className="h-5 w-px bg-slate-800 mx-1.5 hidden sm:block" />
                        <button
                            onClick={() => onNavigate('prev')}
                            disabled={currentIndex <= 0}
                            className="p-2 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-white/[0.06] transition-colors"
                            aria-label="Previous lesson"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            onClick={() => onNavigate('next')}
                            disabled={currentIndex >= totalFiles - 1}
                            className="p-2 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-white/[0.06] transition-colors"
                            aria-label="Next lesson"
                        >
                            <ArrowRight size={16} />
                        </button>
                        <div className="h-5 w-px bg-slate-800 mx-1.5 hidden sm:block" />
                    </>
                )}

                {/* Auth button */}
                {user ? (
                    <button
                        onClick={logOut}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut size={14} />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogIn size={14} />
                        <span className="hidden sm:inline">Sign In</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
