import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isConfigured, signInWithGoogle, signOut } from '@/lib/firebase';
import type { UserProfile } from '@/types';

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    isDemo: boolean;
    error: string | null;
    signIn: () => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
    user: null,
    loading: true,
    isDemo: true,
    error: null,
    signIn: async () => { },
    logOut: async () => { },
});

// ─────────────────────────────────────────────
// DEMO MODE KEY
// ─────────────────────────────────────────────

const DEMO_KEY = 'devtutorials-demo-user';

const mapFirebaseUser = (u: User): UserProfile => ({
    uid: u.uid,
    displayName: u.displayName,
    email: u.email,
    photoURL: u.photoURL,
});

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isDemo = !isConfigured;

    useEffect(() => {
        if (isConfigured && auth) {
            const unsub = onAuthStateChanged(auth, (firebaseUser: User | null) => {
                setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
                setError(null);
                setLoading(false);
            });
            return unsub;
        }

        // Demo mode: check localStorage
        const stored = localStorage.getItem(DEMO_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const signIn = useCallback(async () => {
        if (isDemo) {
            const demoUser: UserProfile = {
                uid: 'demo-user',
                displayName: 'Demo User',
                email: 'demo@devtutorials.io',
                photoURL: null,
            };
            setUser(demoUser);
            localStorage.setItem(DEMO_KEY, JSON.stringify(demoUser));
            return;
        }

        setError(null);
        try {
            const result = await signInWithGoogle();
            setUser(mapFirebaseUser(result.user));
        } catch (err: unknown) {
            // Don't surface popup-closed-by-user — that's intentional
            if (err instanceof Error && err.message.includes('popup-closed-by-user')) return;
            const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
            setError(message);
            throw err;
        }
    }, [isDemo]);

    const logOut = useCallback(async () => {
        if (isDemo) {
            setUser(null);
            localStorage.removeItem(DEMO_KEY);
            return;
        }
        await signOut();
        setUser(null);
        setError(null);
    }, [isDemo]);

    return (
        <AuthContext.Provider value={{ user, loading, isDemo, error, signIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
