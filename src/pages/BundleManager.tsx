import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Package,
    Check,
    X,
    Edit3,
    Folder,
    Minus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseContext } from '@/contexts/CourseContext';
import { useBundleContext } from '@/contexts/BundleContext';
import { useNavigate } from 'react-router-dom';

const BundleManager: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { courses } = useCourseContext();
    const {
        bundles,
        activeBundleId,
        createBundle,
        renameBundle,
        deleteBundle,
        addCourseToBundle,
        removeCourseFromBundle,
        reorderBundle,
        setActiveBundleId,
    } = useBundleContext();

    const [newBundleName, setNewBundleName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [addingCourseTo, setAddingCourseTo] = useState<string | null>(null);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Package size={48} className="text-indigo-400/40" />
                <p className="text-slate-400">Sign in to manage bundles.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                    Sign In
                </button>
            </div>
        );
    }

    const handleCreate = () => {
        if (!newBundleName.trim()) return;
        createBundle(newBundleName.trim());
        setNewBundleName('');
    };

    const handleStartRename = (id: string, name: string) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleSaveRename = () => {
        if (!editingId || !editName.trim()) return;
        renameBundle(editingId, editName.trim());
        setEditingId(null);
    };

    return (
        <>
            <Helmet>
                <title>Manage Bundles — DevTutorials.io</title>
            </Helmet>

            <div className="max-w-3xl mx-auto px-6 py-12 md:px-10">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-white mb-1">Bundle Manager</h1>
                    <p className="text-sm text-slate-500">Group courses into bundles and switch between them from the sidebar.</p>
                </div>

                {/* Create bundle */}
                <div className="mb-8 flex gap-2">
                    <input
                        type="text"
                        placeholder="New bundle name..."
                        value={newBundleName}
                        onChange={(e) => setNewBundleName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="flex-1 bg-slate-900/60 border border-slate-800/60 rounded-lg px-4 py-2.5 text-sm
                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
                            transition-all placeholder:text-slate-600"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newBundleName.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium
                            hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Add Bundle</span>
                    </button>
                </div>

                {/* Bundle list */}
                <div className="space-y-4">
                    {bundles.map((bundle, idx) => {
                        const isActive = activeBundleId === bundle.id;
                        const bundleCourses = courses.filter((c) => bundle.courseIds.includes(c.id));
                        const availableCourses = courses.filter((c) => !bundle.courseIds.includes(c.id));

                        return (
                            <div
                                key={bundle.id}
                                className={`rounded-xl bg-slate-900/40 border overflow-hidden transition-colors ${isActive ? 'border-indigo-500/40' : 'border-slate-800/40'
                                    }`}
                            >
                                {/* Bundle header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Package size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                                        {editingId === bundle.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                                                    autoFocus
                                                    className="bg-slate-950/60 border border-slate-700 rounded px-2 py-1 text-sm text-white
                                                        focus:outline-none focus:border-indigo-500/50"
                                                />
                                                <button onClick={handleSaveRename} className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer">
                                                    <Check size={14} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:text-white cursor-pointer">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="font-semibold text-sm text-white truncate">{bundle.name}</span>
                                                <span className="text-xs text-slate-500">{bundleCourses.length} courses</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {/* Set active */}
                                        <button
                                            onClick={() => setActiveBundleId(isActive ? null : bundle.id)}
                                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${isActive
                                                    ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                                                    : 'text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10'
                                                }`}
                                        >
                                            {isActive ? 'Active' : 'Set Active'}
                                        </button>

                                        <button onClick={() => reorderBundle(bundle.id, 'up')} disabled={idx === 0}
                                            className="p-1.5 text-slate-500 hover:text-white disabled:opacity-20 rounded transition-colors cursor-pointer">
                                            <ChevronUp size={14} />
                                        </button>
                                        <button onClick={() => reorderBundle(bundle.id, 'down')} disabled={idx === bundles.length - 1}
                                            className="p-1.5 text-slate-500 hover:text-white disabled:opacity-20 rounded transition-colors cursor-pointer">
                                            <ChevronDown size={14} />
                                        </button>
                                        <button onClick={() => handleStartRename(bundle.id, bundle.name)}
                                            className="p-1.5 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer" title="Rename">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => deleteBundle(bundle.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Courses in bundle */}
                                <div className="divide-y divide-slate-800/20">
                                    {bundleCourses.map((course) => (
                                        <div key={course.id} className="flex items-center justify-between px-4 py-2.5 pl-10 group hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Folder size={13} className="text-indigo-400/60 shrink-0" />
                                                <span className="text-sm text-slate-300 truncate">{course.name}</span>
                                                <span className="text-[11px] text-slate-600">{course.children?.length || 0} items</span>
                                            </div>
                                            <button
                                                onClick={() => removeCourseFromBundle(bundle.id, course.id)}
                                                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 rounded transition-all cursor-pointer"
                                                title="Remove from bundle"
                                            >
                                                <Minus size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {bundleCourses.length === 0 && (
                                        <div className="px-4 py-4 text-center text-xs text-slate-600">
                                            No courses added yet.
                                        </div>
                                    )}
                                </div>

                                {/* Add course dropdown */}
                                {availableCourses.length > 0 && (
                                    <div className="border-t border-slate-800/30 px-4 py-2.5">
                                        {addingCourseTo === bundle.id ? (
                                            <div className="flex flex-wrap gap-2">
                                                {availableCourses.map((course) => (
                                                    <button
                                                        key={course.id}
                                                        onClick={() => {
                                                            addCourseToBundle(bundle.id, course.id);
                                                        }}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-slate-800/50 text-slate-300
                                                            border border-slate-700/40 rounded-lg hover:border-indigo-500/40 hover:text-indigo-300
                                                            transition-colors cursor-pointer"
                                                    >
                                                        <Plus size={11} />
                                                        <span>{course.name}</span>
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setAddingCourseTo(null)}
                                                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAddingCourseTo(bundle.id)}
                                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-300 transition-colors cursor-pointer"
                                            >
                                                <Plus size={12} />
                                                <span>Add Course</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {bundles.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 text-slate-700" />
                        <p>No bundles yet. Create one above to group your courses.</p>
                    </div>
                )}

                <div className="h-20" />
            </div>
        </>
    );
};

export default BundleManager;
