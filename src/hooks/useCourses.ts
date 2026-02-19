import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, defaultCourses } from '@/data/courses';
import type { FileNode } from '@/types';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useCourses() {
    const [courses, setCourses] = useState<FileNode[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
            return raw ? JSON.parse(raw) : defaultCourses;
        } catch {
            return defaultCourses;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    }, [courses]);

    const addCourse = useCallback((name: string) => {
        const newCourse: FileNode = {
            id: generateId(),
            name,
            type: 'folder',
            children: [],
        };
        setCourses((prev) => [...prev, newCourse]);
        return newCourse.id;
    }, []);

    const addLesson = useCallback((courseId: string, name: string, content: string) => {
        const lessonId = generateId();
        setCourses((prev) =>
            prev.map((course) => {
                if (course.id === courseId) {
                    return {
                        ...course,
                        children: [
                            ...(course.children || []),
                            { id: lessonId, name, type: 'file' as const, content },
                        ],
                    };
                }
                return course;
            })
        );
        return lessonId;
    }, []);

    const updateLesson = useCallback(
        (courseId: string, lessonId: string, updates: { name?: string; content?: string }) => {
            setCourses((prev) =>
                prev.map((course) => {
                    if (course.id === courseId) {
                        return {
                            ...course,
                            children: course.children?.map((lesson) =>
                                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
                            ),
                        };
                    }
                    return course;
                })
            );
        },
        []
    );

    const deleteLesson = useCallback((courseId: string, lessonId: string) => {
        setCourses((prev) =>
            prev.map((course) => {
                if (course.id === courseId) {
                    return {
                        ...course,
                        children: course.children?.filter((l) => l.id !== lessonId),
                    };
                }
                return course;
            })
        );
    }, []);

    const deleteCourse = useCallback((courseId: string) => {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }, []);

    const reorderLesson = useCallback(
        (courseId: string, lessonId: string, direction: 'up' | 'down') => {
            setCourses((prev) =>
                prev.map((course) => {
                    if (course.id !== courseId || !course.children) return course;
                    const children = [...course.children];
                    const idx = children.findIndex((c) => c.id === lessonId);
                    if (idx === -1) return course;
                    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
                    if (swapIdx < 0 || swapIdx >= children.length) return course;
                    [children[idx], children[swapIdx]] = [children[swapIdx], children[idx]];
                    return { ...course, children };
                })
            );
        },
        []
    );

    const reorderCourse = useCallback(
        (courseId: string, direction: 'up' | 'down') => {
            setCourses((prev) => {
                const arr = [...prev];
                const idx = arr.findIndex((c) => c.id === courseId);
                if (idx === -1) return prev;
                const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
                if (swapIdx < 0 || swapIdx >= arr.length) return prev;
                [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
                return arr;
            });
        },
        []
    );

    const importMarkdown = useCallback((courseId: string, file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const name = file.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');
                const id = addLesson(courseId, name, content);
                resolve(id);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }, [addLesson]);

    const resetToDefaults = useCallback(() => {
        setCourses(defaultCourses);
    }, []);

    return {
        courses,
        addCourse,
        addLesson,
        updateLesson,
        deleteLesson,
        deleteCourse,
        reorderLesson,
        reorderCourse,
        importMarkdown,
        resetToDefaults,
    };
}
