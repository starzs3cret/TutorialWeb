import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from './App';

describe('MarkdownRenderer', () => {
    it('renders headers correctly', () => {
        render(<MarkdownRenderer content="# Hello World" />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Hello World');
        expect(heading).toHaveClass('text-4xl');
    });

    it('renders subheaders correctly', () => {
        render(<MarkdownRenderer content="## Subheader" />);
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toHaveTextContent('Subheader');
        expect(heading).toHaveClass('text-2xl');
    });

    it('renders lists correctly', () => {
        render(<MarkdownRenderer content="- Item 1" />);
        const listItem = screen.getByText('Item 1');
        expect(listItem.tagName).toBe('LI');
        expect(listItem).toHaveClass('list-disc');
    });

    it('renders bold text correctly', () => {
        render(<MarkdownRenderer content="This is **bold** text" />);
        const boldText = screen.getByText('bold');
        expect(boldText.tagName).toBe('STRONG');
    });
});
