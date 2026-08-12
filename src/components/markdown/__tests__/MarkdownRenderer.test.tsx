import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownRenderer from '../MarkdownRenderer';


vi.mock('mermaid', () => ({
    default: {
        initialize: vi.fn(),
        render: vi.fn().mockResolvedValue({
            svg: '<svg data-testid="mock-mermaid-svg"></svg>',
            diagramType: 'flowchart',
            bindFunctions: undefined,
        }),
    },
}));

describe('MarkdownRenderer', () => {
    it('renders headings and paragraph text correctly', () => {
        const content = '# Title Header\n\nThis is a test paragraph with **bold** text.';
        render(<MarkdownRenderer content={content} />);

        expect(screen.getByRole('heading', { level: 1, name: /Title Header/i })).toBeInTheDocument();
        expect(screen.getByText(/This is a test paragraph with/i)).toBeInTheDocument();
        expect(screen.getByText('bold')).toBeInTheDocument();
    });

    it('renders bullet list items', () => {
        const content = '- First item\n- Second item\n- Third item';
        render(<MarkdownRenderer content={content} />);

        expect(screen.getByText('First item')).toBeInTheDocument();
        expect(screen.getByText('Second item')).toBeInTheDocument();
        expect(screen.getByText('Third item')).toBeInTheDocument();
    });

    it('renders code fence blocks and delegates mermaid diagrams', async () => {
        const content = `
# Markdown with Mermaid

Here is a diagram:

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Fine, thank you!
\`\`\`
`;
        render(<MarkdownRenderer content={content} />);

        expect(screen.getByRole('heading', { level: 1, name: /Markdown with Mermaid/i })).toBeInTheDocument();
        expect(screen.getByText('MERMAID')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('mock-mermaid-svg')).toBeInTheDocument();
        });
    });
});
