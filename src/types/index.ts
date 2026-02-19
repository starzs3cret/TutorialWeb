// ─────────────────────────────────────────────
// TYPES — Single source of truth
// ─────────────────────────────────────────────

export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileNode[];
}

export interface Bundle {
    id: string;
    name: string;
    courseIds: string[];
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}
