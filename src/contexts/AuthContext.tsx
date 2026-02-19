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
    signIn: () => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
    user: null,
    loading: true,
    isDemo: true,
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
    const isDemo = !isConfigured;

    useEffect(() => {
        if (isConfigured && auth) {
            const unsub = onAuthStateChanged(auth, (firebaseUser: User | null) => {
                setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
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
        const result = await signInWithGoogle();
        setUser(mapFirebaseUser(result.user));
    }, [isDemo]);

    const logOut = useCallback(async () => {
        if (isDemo) {
            setUser(null);
            localStorage.removeItem(DEMO_KEY);
            return;
        }
        await signOut();
        setUser(null);
    }, [isDemo]);

    return (
        <AuthContext.Provider value={{ user, loading, isDemo, signIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
