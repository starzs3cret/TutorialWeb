import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Code2,
    Trophy,
    CheckCircle2,
    ArrowRight,
    RotateCcw,
} from 'lucide-react';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import { useCourseContext } from '@/contexts/CourseContext';
import { useBundleContext } from '@/contexts/BundleContext';

const CourseViewer: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const { completedFiles, toggleComplete, progress } = useCourseContext();
    const { filteredFlatFiles: flatFiles } = useBundleContext();

    const currentIndex = useMemo(
        () => flatFiles.findIndex((f) => f.id === lessonId),
        [flatFiles, lessonId]
    );

    const activeFile = currentIndex >= 0 ? flatFiles[currentIndex] : null;

    // Redirect to first lesson if invalid id
    useEffect(() => {
        if (!activeFile && flatFiles.length > 0) {
            navigate(`/course/${flatFiles[0].id}`, { replace: true });
        }
    }, [activeFile, flatFiles, navigate]);

    // Scroll to top on file change
    useEffect(() => {
        document.getElementById('content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [lessonId]);

    const navigateLesson = useCallback(
        (direction: 'prev' | 'next') => {
            const idx = flatFiles.findIndex((f) => f.id === lessonId);
            if (direction === 'next' && idx < flatFiles.length - 1) {
                navigate(`/course/${flatFiles[idx + 1].id}`);
            } else if (direction === 'prev' && idx > 0) {
                navigate(`/course/${flatFiles[idx - 1].id}`);
            }
        },
        [lessonId, flatFiles, navigate]
    );

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowRight') navigateLesson('next');
            else if (e.key === 'ArrowLeft') navigateLesson('prev');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigateLesson]);

    const handleMarkComplete = useCallback(() => {
        if (!lessonId) return;
        toggleComplete(lessonId);
    }, [lessonId, toggleComplete]);

    const handleCompleteAndNext = useCallback(() => {
        if (!lessonId) return;
        // Only mark complete if not already completed, then advance
        if (!completedFiles.includes(lessonId)) {
            toggleComplete(lessonId);
        }
        const idx = flatFiles.findIndex((f) => f.id === lessonId);
        if (idx < flatFiles.length - 1) {
            navigate(`/course/${flatFiles[idx + 1].id}`);
        }
    }, [lessonId, flatFiles, completedFiles, toggleComplete, navigate]);

    if (!activeFile) return null;

    const isCompleted = completedFiles.includes(activeFile.id);

    return (
        <>
            <Helmet>
                <title>{activeFile.name} — DevTutorials.io</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-6 py-12 md:px-10">
                {/* Meta badge */}
                <div className="mb-8 flex items-center gap-2 text-primary/80 text-xs font-medium uppercase tracking-widest">
                    <Code2 size={14} />
                    <span>Lesson {currentIndex + 1} of {flatFiles.length}</span>
                </div>

                {/* Article */}
                <article>
                    <MarkdownRenderer content={activeFile.content || ''} />
                </article>

                {/* Action footer */}
                <div className="mt-16 pt-8 border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-fg-muted text-xs">
                        Lesson {currentIndex + 1} of {flatFiles.length}
                    </div>

                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <button
                                onClick={handleMarkComplete}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-fg-muted hover:text-warning hover:bg-warning-bg transition-all cursor-pointer"
                                title="Undo completion"
                            >
                                <RotateCcw size={14} />
                                <span>Undo</span>
                            </button>
                        )}

                        <button
                            onClick={isCompleted ? handleCompleteAndNext : handleMarkComplete}
                            className={`
                                flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer
                                ${isCompleted
                                    ? 'bg-success-bg text-success border border-success/30 hover:bg-success/20'
                                    : 'bg-primary text-primary-fg hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'}
                            `}
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    <span>Completed</span>
                                </>
                            ) : (
                                <>
                                    <Trophy size={18} />
                                    <span>Mark as Complete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Next lesson teaser */}
                {currentIndex < flatFiles.length - 1 && (
                    <button
                        onClick={() => navigateLesson('next')}
                        className="mt-6 w-full p-4 bg-surface/50 border border-border-default rounded-xl cursor-pointer
                            hover:border-primary/30 group transition-all text-left"
                    >
                        <div className="text-[11px] uppercase tracking-widest text-fg-muted mb-1">Up Next</div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-fg-primary group-hover:text-primary transition-colors">
                                {flatFiles[currentIndex + 1].name}
                            </span>
                            <ArrowRight
                                size={16}
                                className="text-fg-muted group-hover:text-primary group-hover:translate-x-1 transition-all"
                            />
                        </div>
                    </button>
                )}

                {/* Completion celebration */}
                {progress === 100 && (
                    <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center">
                        <div className="text-4xl mb-3">🎉</div>
                        <h3 className="text-xl font-bold text-fg-primary mb-2">Course Complete!</h3>
                        <p className="text-fg-secondary text-sm">
                            You've completed all lessons. You're now a React pro.
                        </p>
                    </div>
                )}

                <div className="h-20" />
            </div>
        </>
    );
};

export default CourseViewer;
