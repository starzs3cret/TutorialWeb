import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, flattenFileSystem } from '@/data/courses';
import type { FileNode } from '@/types';

export function useCourseProgress(courses: FileNode[]) {
    const flatFiles = flattenFileSystem(courses);

    const [completedFiles, setCompletedFiles] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedFiles));
    }, [completedFiles]);

    const markComplete = useCallback((id: string) => {
        setCompletedFiles((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    }, []);

    const isCompleted = useCallback(
        (id: string) => completedFiles.includes(id),
        [completedFiles]
    );

    const progress = flatFiles.length > 0
        ? Math.round((completedFiles.length / flatFiles.length) * 100)
        : 0;

    return { completedFiles, markComplete, isCompleted, progress, flatFiles };
}
