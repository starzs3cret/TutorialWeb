import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MermaidBlock from '../MermaidBlock';
import mermaid from 'mermaid';

vi.mock('mermaid', () => ({
    default: {
        initialize: vi.fn(),
        render: vi.fn(),
    },
}));

describe('MermaidBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders mermaid diagram when valid code is provided', async () => {
        vi.mocked(mermaid.render).mockResolvedValue({
            svg: '<svg data-testid="mock-svg"><text>Diagram Content</text></svg>',
            diagramType: 'flowchart',
            bindFunctions: undefined,
        });

        const code = 'graph TD;\nA-->B;';
        render(<MermaidBlock code={code} />);

        expect(screen.getByText('MERMAID')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByTestId('mock-svg')).toBeInTheDocument();
        });
    });

    it('renders error message when mermaid parsing fails', async () => {
        vi.mocked(mermaid.render).mockRejectedValue(new Error('Syntax error in diagram spec'));

        const invalidCode = 'invalid mermaid code';
        render(<MermaidBlock code={invalidCode} />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to render diagram: Syntax error in diagram spec/i)).toBeInTheDocument();
        });
    });

    it('toggles between diagram view and code view', async () => {
        vi.mocked(mermaid.render).mockResolvedValue({
            svg: '<svg data-testid="mock-svg"></svg>',
            diagramType: 'flowchart',
            bindFunctions: undefined,
        });

        const code = 'graph TD;\nA-->B;';
        render(<MermaidBlock code={code} />);

        const codeBtn = screen.getByRole('button', { name: /view code/i });
        fireEvent.click(codeBtn);

        expect(screen.getByText('graph TD;')).toBeInTheDocument();
        expect(screen.getByText('A-->B;')).toBeInTheDocument();

        const diagramBtn = screen.getByRole('button', { name: /view diagram/i });
        fireEvent.click(diagramBtn);

        await waitFor(() => {
            expect(screen.getByTestId('mock-svg')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByTestId('mock-svg')).toBeInTheDocument();
        });
    });

    it('automatically sanitizes unescaped semicolons in labels when initial render fails', async () => {
        vi.mocked(mermaid.render)
            .mockRejectedValueOnce(new Error('Parse error on line 2: semicolon'))
            .mockResolvedValueOnce({
                svg: '<svg data-testid="sanitized-svg"></svg>',
                diagramType: 'sequence',
                bindFunctions: undefined,
            });

        const code = 'sequenceDiagram\nDecryptAction->>ConfirmAction: Format: "$deviceId;$key" & Encrypt()';
        render(<MermaidBlock code={code} />);

        await waitFor(() => {
            expect(screen.getByTestId('sanitized-svg')).toBeInTheDocument();
        });
    });
});
