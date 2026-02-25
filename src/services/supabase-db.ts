import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { FileNode, Bundle } from '@/types';

// ─────────────────────────────────────────────
// Supabase DB Service — Pure async functions.
// Zero React dependency. Single table, one row
// per user, JSONB columns for each data domain.
// ─────────────────────────────────────────────

export interface UserData {
    courses: FileNode[];
    bundles: Bundle[];
    completed_lessons: string[];
    active_bundle_id: string | null;
}

const TABLE = 'user_data';

/**
 * Fetch all user data. Returns null if no row exists.
 */
export async function getUserData(uid: string): Promise<UserData | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
        .from(TABLE)
        .select('courses, bundles, completed_lessons, active_bundle_id')
        .eq('uid', uid)
        .maybeSingle();

    if (error) {
        console.error('[supabase-db] getUserData error:', error.message);
        return null;
    }

    return data as UserData | null;
}

/**
 * Upsert all user data in a single operation.
 * Called with debounce from the sync provider.
 */
export async function saveUserData(uid: string, userData: UserData): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
        .from(TABLE)
        .upsert(
            {
                uid,
                courses: userData.courses,
                bundles: userData.bundles,
                completed_lessons: userData.completed_lessons,
                active_bundle_id: userData.active_bundle_id,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'uid' }
        );

    if (error) {
        console.error('[supabase-db] saveUserData error:', error.message);
    }
}

/**
 * Delete user data row (account cleanup).
 */
export async function deleteUserData(uid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('uid', uid);

    if (error) {
        console.error('[supabase-db] deleteUserData error:', error.message);
    }
}
