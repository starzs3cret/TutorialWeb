import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseContext } from '@/contexts/CourseContext';
import { useBundleContext } from '@/contexts/BundleContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getUserData, saveUserData, type UserData } from '@/services/supabase-db';

// ─────────────────────────────────────────────
// SUPABASE SYNC PROVIDER
// Sits inside all other providers. Coordinates
// bi-directional sync: hydrate on login, save
// on mutation (debounced). Invisible to the UI.
// ─────────────────────────────────────────────

const DEBOUNCE_MS = 500;

export const SupabaseSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isDemo } = useAuth();
    const {
        courses,
        completedFiles,
        hydrateCourses,
        hydrateCompleted,
    } = useCourseContext();
    const {
        bundles,
        activeBundleId,
        hydrateBundles,
        hydrateActiveBundleId,
    } = useBundleContext();

    // Guards
    const isHydrating = useRef(false);
    const hasFetched = useRef<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    // ── Hydrate from Supabase on login ──

    useEffect(() => {
        if (!isSupabaseConfigured || isDemo || !user?.uid) {
            hasFetched.current = null;
            return;
        }

        // Already fetched for this user
        if (hasFetched.current === user.uid) return;

        let cancelled = false;

        const hydrate = async () => {
            isHydrating.current = true;
            hasFetched.current = user.uid;

            const data = await getUserData(user.uid);

            if (cancelled) return;

            if (data) {
                // Cloud data exists → use it
                hydrateCourses(data.courses);
                hydrateCompleted(data.completed_lessons);
                hydrateBundles(data.bundles);
                hydrateActiveBundleId(data.active_bundle_id);
            } else {
                // First time → seed Supabase from localStorage
                await saveUserData(user.uid, {
                    courses,
                    bundles,
                    completed_lessons: completedFiles,
                    active_bundle_id: activeBundleId,
                });
            }

            // Small delay to let React settle before enabling save
            setTimeout(() => {
                isHydrating.current = false;
            }, 300);
        };

        hydrate();

        return () => {
            cancelled = true;
        };
        // Only re-run when user changes — not on data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isDemo]);

    // ── Debounced save on data mutation ──

    const save = useCallback(() => {
        if (!isSupabaseConfigured || isDemo || !user?.uid) return;
        if (isHydrating.current) return;

        const payload: UserData = {
            courses,
            bundles,
            completed_lessons: completedFiles,
            active_bundle_id: activeBundleId,
        };

        saveUserData(user.uid, payload);
    }, [user?.uid, isDemo, courses, bundles, completedFiles, activeBundleId]);

    useEffect(() => {
        if (!isSupabaseConfigured || isDemo || !user?.uid) return;
        if (isHydrating.current) return;

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(save, DEBOUNCE_MS);

        return () => clearTimeout(debounceTimer.current);
    }, [save, user?.uid, isDemo]);

    return <>{children}</>;
};
