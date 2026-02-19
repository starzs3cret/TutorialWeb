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
                <Package size={48} className="text-primary/40" />
                <p className="text-fg-muted">Sign in to manage bundles.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-primary text-primary-fg rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
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
                    <h1 className="text-2xl font-bold text-fg-primary mb-1">Bundle Manager</h1>
                    <p className="text-sm text-fg-secondary">Group courses into bundles and switch between them from the sidebar.</p>
                </div>

                {/* Create bundle */}
                <div className="mb-8 flex gap-2">
                    <input
                        type="text"
                        placeholder="New bundle name..."
                        value={newBundleName}
                        onChange={(e) => setNewBundleName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="flex-1 bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm
                            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
                            transition-all placeholder:text-fg-muted text-fg-primary"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newBundleName.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-fg rounded-lg text-sm font-medium
                            hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                                className={`rounded-xl bg-surface/40 border overflow-hidden transition-colors ${isActive ? 'border-primary/40' : 'border-border-default'
                                    }`}
                            >
                                {/* Bundle header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-surface-highlight/50">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Package size={16} className={isActive ? 'text-primary' : 'text-fg-muted'} />
                                        {editingId === bundle.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                                                    autoFocus
                                                    className="bg-surface border border-border-highlight rounded px-2 py-1 text-sm text-fg-primary
                                                        focus:outline-none focus:border-primary/50"
                                                />
                                                <button onClick={handleSaveRename} className="p-1 text-success hover:text-success/80 cursor-pointer">
                                                    <Check size={14} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1 text-fg-muted hover:text-fg-primary cursor-pointer">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="font-semibold text-sm text-fg-primary truncate">{bundle.name}</span>
                                                <span className="text-xs text-fg-muted">{bundleCourses.length} courses</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {/* Set active */}
                                        <button
                                            onClick={() => setActiveBundleId(isActive ? null : bundle.id)}
                                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${isActive
                                                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                                : 'text-fg-muted hover:text-primary hover:bg-primary/10'
                                                }`}
                                        >
                                            {isActive ? 'Active' : 'Set Active'}
                                        </button>

                                        <button onClick={() => reorderBundle(bundle.id, 'up')} disabled={idx === 0}
                                            className="p-1.5 text-fg-muted hover:text-fg-primary disabled:opacity-20 rounded transition-colors cursor-pointer">
                                            <ChevronUp size={14} />
                                        </button>
                                        <button onClick={() => reorderBundle(bundle.id, 'down')} disabled={idx === bundles.length - 1}
                                            className="p-1.5 text-fg-muted hover:text-fg-primary disabled:opacity-20 rounded transition-colors cursor-pointer">
                                            <ChevronDown size={14} />
                                        </button>
                                        <button onClick={() => handleStartRename(bundle.id, bundle.name)}
                                            className="p-1.5 text-fg-muted hover:text-warning rounded transition-colors cursor-pointer" title="Rename">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => deleteBundle(bundle.id)}
                                            className="p-1.5 text-fg-muted hover:text-warning rounded transition-colors cursor-pointer" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Courses in bundle */}
                                <div className="divide-y divide-border-default/50">
                                    {bundleCourses.map((course) => (
                                        <div key={course.id} className="flex items-center justify-between px-4 py-2.5 pl-10 group hover:bg-surface-highlight/30 transition-colors">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Folder size={13} className="text-secondary/60 shrink-0" />
                                                <span className="text-sm text-fg-secondary truncate">{course.name}</span>
                                                <span className="text-[11px] text-fg-muted">{course.children?.length || 0} items</span>
                                            </div>
                                            <button
                                                onClick={() => removeCourseFromBundle(bundle.id, course.id)}
                                                className="p-1.5 text-fg-muted hover:text-warning opacity-0 group-hover:opacity-100 rounded transition-all cursor-pointer"
                                                title="Remove from bundle"
                                            >
                                                <Minus size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {bundleCourses.length === 0 && (
                                        <div className="px-4 py-4 text-center text-xs text-fg-muted">
                                            No courses added yet.
                                        </div>
                                    )}
                                </div>

                                {/* Add course dropdown */}
                                {availableCourses.length > 0 && (
                                    <div className="border-t border-border-default/50 px-4 py-2.5">
                                        {addingCourseTo === bundle.id ? (
                                            <div className="flex flex-wrap gap-2">
                                                {availableCourses.map((course) => (
                                                    <button
                                                        key={course.id}
                                                        onClick={() => {
                                                            addCourseToBundle(bundle.id, course.id);
                                                        }}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-surface-highlight text-fg-secondary
                                                            border border-border-default rounded-lg hover:border-primary/40 hover:text-primary
                                                            transition-colors cursor-pointer"
                                                    >
                                                        <Plus size={11} />
                                                        <span>{course.name}</span>
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setAddingCourseTo(null)}
                                                    className="px-2.5 py-1.5 text-xs text-fg-muted hover:text-fg-primary rounded-lg hover:bg-surface-highlight transition-colors cursor-pointer"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAddingCourseTo(bundle.id)}
                                                className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-primary transition-colors cursor-pointer"
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
                    <div className="text-center py-16 text-fg-muted">
                        <Package size={48} className="mx-auto mb-4 text-fg-muted/50" />
                        <p>No bundles yet. Create one above to group your courses.</p>
                    </div>
                )}

                <div className="h-20" />
            </div>
        </>
    );
};

export default BundleManager;
