import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { STORAGE_KEYS, flattenFileSystem } from '@/data/courses';
import { useCourseContext } from './CourseContext';
import type { Bundle } from '@/types';

// ─────────────────────────────────────────────
// BUNDLE CONTEXT — Groups of courses
// ─────────────────────────────────────────────

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface BundleContextValue {
    bundles: Bundle[];
    activeBundleId: string | null;
    activeBundle: Bundle | null;
    filteredCourses: import('@/types').FileNode[];
    filteredFlatFiles: import('@/types').FileNode[];
    createBundle: (name: string) => string;
    renameBundle: (id: string, newName: string) => void;
    deleteBundle: (id: string) => void;
    addCourseToBundle: (bundleId: string, courseId: string) => void;
    removeCourseFromBundle: (bundleId: string, courseId: string) => void;
    reorderBundle: (bundleId: string, direction: 'up' | 'down') => void;
    setActiveBundleId: (id: string | null) => void;
}

const BundleContext = createContext<BundleContextValue | null>(null);

export function useBundleContext() {
    const ctx = useContext(BundleContext);
    if (!ctx) throw new Error('useBundleContext must be used within BundleProvider');
    return ctx;
}

export const BundleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { courses } = useCourseContext();

    const [bundles, setBundles] = useState<Bundle[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.BUNDLES);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [activeBundleId, setActiveBundleId] = useState<string | null>(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.ACTIVE_BUNDLE) || null;
        } catch {
            return null;
        }
    });

    // Persist bundles
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.BUNDLES, JSON.stringify(bundles));
    }, [bundles]);

    // Persist active bundle
    useEffect(() => {
        if (activeBundleId) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_BUNDLE, activeBundleId);
        } else {
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_BUNDLE);
        }
    }, [activeBundleId]);

    // Derived
    const activeBundle = useMemo(
        () => bundles.find((b) => b.id === activeBundleId) || null,
        [bundles, activeBundleId]
    );

    const filteredCourses = useMemo(() => {
        if (!activeBundle) return courses;
        return courses.filter((c) => activeBundle.courseIds.includes(c.id));
    }, [courses, activeBundle]);

    const filteredFlatFiles = useMemo(
        () => flattenFileSystem(filteredCourses),
        [filteredCourses]
    );

    // ── CRUD ──

    const createBundle = useCallback((name: string) => {
        const id = generateId();
        setBundles((prev) => [...prev, { id, name, courseIds: [] }]);
        return id;
    }, []);

    const renameBundle = useCallback((id: string, newName: string) => {
        setBundles((prev) =>
            prev.map((b) => (b.id === id ? { ...b, name: newName } : b))
        );
    }, []);

    const deleteBundle = useCallback((id: string) => {
        setBundles((prev) => prev.filter((b) => b.id !== id));
        setActiveBundleId((prev) => (prev === id ? null : prev));
    }, []);

    const addCourseToBundle = useCallback((bundleId: string, courseId: string) => {
        setBundles((prev) =>
            prev.map((b) => {
                if (b.id !== bundleId) return b;
                if (b.courseIds.includes(courseId)) return b;
                return { ...b, courseIds: [...b.courseIds, courseId] };
            })
        );
    }, []);

    const removeCourseFromBundle = useCallback((bundleId: string, courseId: string) => {
        setBundles((prev) =>
            prev.map((b) => {
                if (b.id !== bundleId) return b;
                return { ...b, courseIds: b.courseIds.filter((id) => id !== courseId) };
            })
        );
    }, []);

    const reorderBundle = useCallback((bundleId: string, direction: 'up' | 'down') => {
        setBundles((prev) => {
            const arr = [...prev];
            const idx = arr.findIndex((b) => b.id === bundleId);
            if (idx === -1) return prev;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= arr.length) return prev;
            [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
            return arr;
        });
    }, []);

    return (
        <BundleContext.Provider
            value={{
                bundles,
                activeBundleId,
                activeBundle,
                filteredCourses,
                filteredFlatFiles,
                createBundle,
                renameBundle,
                deleteBundle,
                addCourseToBundle,
                removeCourseFromBundle,
                reorderBundle,
                setActiveBundleId,
            }}
        >
            {children}
        </BundleContext.Provider>
    );
};
