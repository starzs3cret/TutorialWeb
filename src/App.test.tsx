import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from './App';

// Mock LocalStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('App Integration', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders loading skeleton initially', () => {
        render(<App />);
        // Checking for a class that indicates skeleton loading
        // Or simpler, check if Sidebar content is not yet visible
        // However, we used classes. Let's rely on text not being present.
        expect(screen.queryByText('Curriculum')).not.toBeInTheDocument();
    });

    it('loads content after simulation', async () => {
        render(<App />);

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText('Curriculum')).toBeInTheDocument();
    });
});
