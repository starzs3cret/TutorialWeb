import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CodeBlock from '../CodeBlock';


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

describe('CodeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders standard code block with language title and line numbers', () => {
        const code = 'const hello = "world";\nconsole.log(hello);';
        render(<CodeBlock language="typescript" code={code} />);

        expect(screen.getByText(/typescript/i)).toBeInTheDocument();
        expect(screen.getByText('const')).toBeInTheDocument();
        expect(screen.getByText('console')).toBeInTheDocument();
    });

    it('copies code to clipboard when copy button is clicked', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        const code = 'const x = 10;';
        render(<CodeBlock language="javascript" code={code} />);

        const copyBtn = screen.getByRole('button', { name: /copy code/i });
        fireEvent.click(copyBtn);

        expect(writeTextMock).toHaveBeenCalledWith(code);
    });

    it('delegates to MermaidBlock when language is mermaid', async () => {
        const code = 'graph LR;\nA-->B;';
        render(<CodeBlock language="mermaid" code={code} />);

        expect(screen.getByText('MERMAID')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId('mock-mermaid-svg')).toBeInTheDocument();
        });
    });
});
