import React, { useState, useCallback } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useCourseContext } from '@/contexts/CourseContext';
import { useBundleContext } from '@/contexts/BundleContext';

// ─────────────────────────────────────────────
// APP LAYOUT — Sidebar + Header + <Outlet>
// ─────────────────────────────────────────────

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { completedFiles } = useCourseContext();
    const { filteredCourses, filteredFlatFiles } = useBundleContext();
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const currentIndex = filteredFlatFiles.findIndex((f) => f.id === lessonId);
    const activeFile = currentIndex >= 0 ? filteredFlatFiles[currentIndex] : null;

    const progress = filteredFlatFiles.length > 0
        ? Math.round((completedFiles.filter((id) => filteredFlatFiles.some((f) => f.id === id)).length / filteredFlatFiles.length) * 100)
        : 0;

    const handleNavigate = useCallback(
        (direction: 'prev' | 'next') => {
            const idx = filteredFlatFiles.findIndex((f) => f.id === lessonId);
            if (direction === 'next' && idx < filteredFlatFiles.length - 1) {
                navigate(`/course/${filteredFlatFiles[idx + 1].id}`);
            } else if (direction === 'prev' && idx > 0) {
                navigate(`/course/${filteredFlatFiles[idx - 1].id}`);
            }
        },
        [lessonId, filteredFlatFiles, navigate]
    );

    return (
        <div className="flex h-screen bg-canvas text-fg-primary font-sans overflow-hidden">
            <Sidebar
                courses={filteredCourses}
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
                    totalFiles={filteredFlatFiles.length}
                    completedCount={completedFiles.filter((id) => filteredFlatFiles.some((f) => f.id === id)).length}
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
