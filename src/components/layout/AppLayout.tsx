import React, { useState, useCallback } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useCourseContext } from '@/contexts/CourseContext';

// ─────────────────────────────────────────────
// APP LAYOUT — Sidebar + Header + <Outlet>
// ─────────────────────────────────────────────

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { courses, flatFiles, completedFiles, progress } = useCourseContext();
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const currentIndex = flatFiles.findIndex((f) => f.id === lessonId);
    const activeFile = currentIndex >= 0 ? flatFiles[currentIndex] : null;

    const handleNavigate = useCallback(
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

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            <Sidebar
                courses={courses}
                activeFileId={lessonId || ''}
                completedFiles={completedFiles}
                progress={progress}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col h-full min-w-0 relative">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeFile={activeFile}
                    currentIndex={currentIndex}
                    totalFiles={flatFiles.length}
                    completedCount={completedFiles.length}
                    onNavigate={handleNavigate}
                />

                <div id="content-scroll" className="flex-1 overflow-y-auto scrollbar-thin">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
