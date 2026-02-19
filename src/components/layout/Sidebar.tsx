import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Folder,
    FileText,
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    Terminal,
    X,
    Search,
    Sparkles,
    Settings,
    Package,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBundleContext } from '@/contexts/BundleContext';
import { flattenFileSystem } from '@/data/courses';
import type { FileNode } from '@/types';

// ─────────────────────────────────────────────
// SIDEBAR ITEM (recursive)
// ─────────────────────────────────────────────

interface SidebarItemProps {
    node: FileNode;
    level: number;
    activeFileId: string;
    completedFiles: string[];
    expandedFolders: string[];
    searchQuery: string;
    onSelectFile: (id: string) => void;
    onToggleFolder: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    node, level, activeFileId, completedFiles, expandedFolders, searchQuery, onSelectFile, onToggleFolder,
}) => {
    if (node.type === 'folder') {
        const isExpanded = expandedFolders.includes(node.id) || searchQuery.length > 0;

        if (searchQuery) {
            const hasMatch = flattenFileSystem(node.children || []).some((f) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (!hasMatch) return null;
        }

        return (
            <div>
                <button
                    onClick={() => onToggleFolder(node.id)}
                    aria-expanded={isExpanded}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer group"
                    style={{ paddingLeft: `${level * 14 + 12}px` }}
                >
                    <span className="mr-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <Folder size={14} className="mr-2 text-indigo-400/70" />
                    <span className="truncate">{node.name}</span>
                </button>
                <div
                    className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    {node.children?.map((child) => (
                        <SidebarItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            activeFileId={activeFileId}
                            completedFiles={completedFiles}
                            expandedFolders={expandedFolders}
                            searchQuery={searchQuery}
                            onSelectFile={onSelectFile}
                            onToggleFolder={onToggleFolder}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // File node
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }

    const isActive = activeFileId === node.id;
    const isCompleted = completedFiles.includes(node.id);

    return (
        <button
            onClick={() => onSelectFile(node.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`
        flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-all cursor-pointer group
        ${isActive
                    ? 'bg-indigo-500/10 text-indigo-300 shadow-[inset_2px_0_0_0] shadow-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'}
      `}
            style={{ paddingLeft: `${level * 14 + 12}px` }}
        >
            <div className="flex items-center min-w-0">
                <FileText
                    size={14}
                    className={`mr-2 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'} transition-colors`}
                />
                <span className="truncate">{node.name}</span>
            </div>
            {isCompleted && (
                <CheckCircle2
                    size={14}
                    className="shrink-0 ml-2 text-emerald-500"
                />
            )}
        </button>
    );
};

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────

interface SidebarProps {
    courses: FileNode[];
    activeFileId: string;
    completedFiles: string[];
    progress: number;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    courses,
    activeFileId,
    completedFiles,
    progress,
    isOpen,
    onClose,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isDemo } = useAuth();
    const { bundles, activeBundleId, setActiveBundleId } = useBundleContext();
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['intro']);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFolder = useCallback((folderId: string) => {
        setExpandedFolders((prev) =>
            prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
        );
    }, []);

    const selectFile = useCallback((id: string) => {
        navigate(`/course/${id}`);
        if (window.innerWidth < 768) onClose();
    }, [navigate, onClose]);

    const isOnManage = location.pathname === '/manage';
    const isOnBundles = location.pathname === '/bundles';

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed md:relative z-30 flex flex-col w-72 h-full bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-800/60 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!isOpen && 'md:w-0 md:border-0 md:overflow-hidden'}
        `}
            >
                {/* Brand */}
                <div className="p-5 border-b border-slate-800/60">
                    <div className="flex items-center justify-between mb-5">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2.5 cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Terminal size={16} className="text-indigo-400" />
                            </div>
                            <h1 className="font-bold text-base tracking-tight text-white">
                                DevTutorials<span className="text-indigo-400">.io</span>
                            </h1>
                        </button>
                        <button
                            onClick={onClose}
                            className="md:hidden p-1 text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span>Course Progress</span>
                            <span className="text-indigo-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Bundle selector */}
                    {bundles.length > 0 && (
                        <div className="relative mb-3">
                            <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-400/60 pointer-events-none" size={13} />
                            <select
                                value={activeBundleId || ''}
                                onChange={(e) => setActiveBundleId(e.target.value || null)}
                                className="w-full appearance-none bg-slate-950/60 border border-slate-800/60 rounded-lg py-2 pl-8 pr-8 text-xs text-slate-300
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
                                    transition-all cursor-pointer"
                            >
                                <option value="">All Courses</option>
                                {bundles.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Filter lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg py-2 pl-8 pr-3 text-xs
                focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
                transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* File tree */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
                    {courses.map((node) => (
                        <SidebarItem
                            key={node.id}
                            node={node}
                            level={0}
                            activeFileId={activeFileId}
                            completedFiles={completedFiles}
                            expandedFolders={expandedFolders}
                            searchQuery={searchQuery}
                            onSelectFile={selectFile}
                            onToggleFolder={toggleFolder}
                        />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800/60 space-y-3">
                    {/* Manage courses link */}
                    <button
                        onClick={() => navigate('/manage')}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${isOnManage
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                            }`}
                    >
                        <Settings size={14} />
                        <span>Manage Courses</span>
                    </button>

                    {/* Manage bundles link */}
                    <button
                        onClick={() => navigate('/bundles')}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${isOnBundles
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                            }`}
                    >
                        <Package size={14} />
                        <span>Manage Bundles</span>
                    </button>

                    {/* User */}
                    <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || ''}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                                {user?.displayName?.[0]?.toUpperCase() || 'G'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                                {user?.displayName || 'Guest'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {user ? (isDemo ? 'Demo Mode' : 'Pro Member') : 'Not signed in'}
                            </div>
                        </div>
                        <Sparkles size={14} className="text-amber-400/60" />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
