import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, defaultCourses, flattenFileSystem } from '@/data/courses';
import type { FileNode } from '@/types';

// ─────────────────────────────────────────────
// COURSE CONTEXT — Single source of truth
// ─────────────────────────────────────────────

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface CourseContextValue {
    // Course data
    courses: FileNode[];
    flatFiles: FileNode[];
    addCourse: (name: string) => string;
    addChapter: (courseId: string, name: string) => string;
    addLesson: (parentId: string, name: string, content: string) => string;
    addLessonToChapter: (chapterId: string, name: string, content: string) => string;
    updateLesson: (lessonId: string, updates: { name?: string; content?: string }) => void;
    deleteNode: (nodeId: string) => void;
    deleteCourse: (courseId: string) => void;
    reorderLesson: (parentId: string, childId: string, direction: 'up' | 'down') => void;
    reorderCourse: (courseId: string, direction: 'up' | 'down') => void;
    importMarkdown: (parentId: string, file: File) => Promise<string>;
    importMultipleMarkdown: (parentId: string, files: File[]) => Promise<string[]>;
    resetToDefaults: () => void;
    // Progress
    completedFiles: string[];
    toggleComplete: (id: string) => void;
    isCompleted: (id: string) => boolean;
    progress: number;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function useCourseContext() {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error('useCourseContext must be used within CourseProvider');
    return ctx;
}

// ─────────────────────────────────────────────
// RECURSIVE HELPERS
// ─────────────────────────────────────────────

function addChildToNode(nodes: FileNode[], parentId: string, child: FileNode): FileNode[] {
    return nodes.map((node) => {
        if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), child] };
        }
        if (node.children) {
            return { ...node, children: addChildToNode(node.children, parentId, child) };
        }
        return node;
    });
}

function addChildrenToNode(nodes: FileNode[], parentId: string, children: FileNode[]): FileNode[] {
    return nodes.map((node) => {
        if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), ...children] };
        }
        if (node.children) {
            return { ...node, children: addChildrenToNode(node.children, parentId, children) };
        }
        return node;
    });
}

function removeNodeById(nodes: FileNode[], nodeId: string): FileNode[] {
    return nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => (n.children ? { ...n, children: removeNodeById(n.children, nodeId) } : n));
}

function updateNodeById(nodes: FileNode[], nodeId: string, updates: Partial<FileNode>): FileNode[] {
    return nodes.map((n) => {
        if (n.id === nodeId) return { ...n, ...updates };
        if (n.children) return { ...n, children: updateNodeById(n.children, nodeId, updates) };
        return n;
    });
}

function reorderChild(nodes: FileNode[], parentId: string, childId: string, direction: 'up' | 'down'): FileNode[] {
    return nodes.map((node) => {
        if (node.id === parentId && node.children) {
            const children = [...node.children];
            const idx = children.findIndex((c) => c.id === childId);
            if (idx === -1) return node;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= children.length) return node;
            [children[idx], children[swapIdx]] = [children[swapIdx], children[idx]];
            return { ...node, children };
        }
        if (node.children) return { ...node, children: reorderChild(node.children, parentId, childId, direction) };
        return node;
    });
}

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courses, setCourses] = useState<FileNode[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
            return raw ? JSON.parse(raw) : defaultCourses;
        } catch {
            return defaultCourses;
        }
    });

    const [completedFiles, setCompletedFiles] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    // Persist courses
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    }, [courses]);

    // Persist progress
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedFiles));
    }, [completedFiles]);

    const flatFiles = flattenFileSystem(courses);

    // ── Course CRUD ──

    const addCourse = useCallback((name: string) => {
        const id = generateId();
        setCourses((prev) => [...prev, { id, name, type: 'folder', children: [] }]);
        return id;
    }, []);

    const addChapter = useCallback((courseId: string, name: string) => {
        const id = generateId();
        setCourses((prev) => addChildToNode(prev, courseId, { id, name, type: 'folder', children: [] }));
        return id;
    }, []);

    const addLesson = useCallback((parentId: string, name: string, content: string) => {
        const id = generateId();
        setCourses((prev) => addChildToNode(prev, parentId, { id, name, type: 'file', content }));
        return id;
    }, []);

    const addLessonToChapter = useCallback((chapterId: string, name: string, content: string) => {
        const id = generateId();
        setCourses((prev) => addChildToNode(prev, chapterId, { id, name, type: 'file', content }));
        return id;
    }, []);

    const updateLesson = useCallback((lessonId: string, updates: { name?: string; content?: string }) => {
        setCourses((prev) => updateNodeById(prev, lessonId, updates));
    }, []);

    const deleteNode = useCallback((nodeId: string) => {
        setCourses((prev) => removeNodeById(prev, nodeId));
    }, []);

    const deleteCourse = useCallback((courseId: string) => {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }, []);

    const reorderLesson = useCallback((parentId: string, childId: string, direction: 'up' | 'down') => {
        setCourses((prev) => reorderChild(prev, parentId, childId, direction));
    }, []);

    const reorderCourse = useCallback((courseId: string, direction: 'up' | 'down') => {
        setCourses((prev) => {
            const arr = [...prev];
            const idx = arr.findIndex((c) => c.id === courseId);
            if (idx === -1) return prev;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= arr.length) return prev;
            [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
            return arr;
        });
    }, []);

    const importMarkdown = useCallback((parentId: string, file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const name = file.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');
                const id = addLesson(parentId, name, content);
                resolve(id);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }, [addLesson]);

    const importMultipleMarkdown = useCallback(async (parentId: string, files: File[]): Promise<string[]> => {
        const promises = files.map(file => new Promise<FileNode>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const name = file.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');
                const id = generateId();
                resolve({ id, name, type: 'file', content });
            };
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsText(file);
        }));

        try {
            const newNodes = await Promise.all(promises);
            const newIds = newNodes.map(n => n.id);
            setCourses(prev => addChildrenToNode(prev, parentId, newNodes));
            return newIds;
        } catch (error) {
            console.error("Error importing files:", error);
            throw error;
        }
    }, []);

    const resetToDefaults = useCallback(() => {
        setCourses(defaultCourses);
    }, []);

    // ── Progress ──

    const toggleComplete = useCallback((id: string) => {
        setCompletedFiles((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    }, []);

    const isCompleted = useCallback(
        (id: string) => completedFiles.includes(id),
        [completedFiles]
    );

    const progress = flatFiles.length > 0
        ? Math.round((completedFiles.filter((id) => flatFiles.some((f) => f.id === id)).length / flatFiles.length) * 100)
        : 0;

    return (
        <CourseContext.Provider
            value={{
                courses,
                flatFiles,
                addCourse,
                addChapter,
                addLesson,
                addLessonToChapter,
                updateLesson,
                deleteNode,
                deleteCourse,
                reorderLesson,
                reorderCourse,
                importMarkdown,
                importMultipleMarkdown,
                resetToDefaults,
                completedFiles,
                toggleComplete,
                isCompleted,
                progress,
            }}
        >
            {children}
        </CourseContext.Provider>
    );
};
