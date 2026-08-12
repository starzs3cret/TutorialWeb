import React, { useState, useEffect, useId, useMemo, useCallback } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, AlertCircle, Code, Eye } from 'lucide-react';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
});

interface MermaidBlockProps {
    code: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
    const [svgHtml, setSvgHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');

    const rawId = useId();
    // Sanitize ID so mermaid can use it as a valid SVG/DOM selector
    const elementId = useMemo(() => {
        return 'mermaid-' + rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    }, [rawId]);

    const lines = useMemo(() => {
        const l = code.split('\n');
        if (l[l.length - 1]?.trim() === '') l.pop();
        return l;
    }, [code]);

    useEffect(() => {
        let isMounted = true;
        
        const renderDiagram = async () => {
            if (!code.trim()) {
                setSvgHtml('');
                setError(null);
                return;
            }

            // Cleanup any existing temporary DOM element leftover from previous attempts
            const existing = document.getElementById(elementId);
            if (existing) {
                existing.remove();
            }

            try {
                const { svg } = await mermaid.render(elementId, code);
                if (isMounted) {
                    setSvgHtml(svg);
                    setError(null);
                }
            } catch (firstErr: unknown) {
                // If initial render fails (e.g. unescaped ';' in labels), attempt auto-preprocessing
                try {
                    const sanitizedCode = code.split('\n').map(line => {
                        if (line.includes(':')) {
                            const idx = line.indexOf(':');
                            return line.substring(0, idx + 1) + line.substring(idx + 1).replace(/;/g, '#59;');
                        }
                        return line;
                    }).join('\n');

                    const cleanupTemp = document.getElementById(elementId);
                    if (cleanupTemp) {
                        cleanupTemp.remove();
                    }

                    const { svg } = await mermaid.render(elementId, sanitizedCode);
                    if (isMounted) {
                        setSvgHtml(svg);
                        setError(null);
                    }
                } catch (err: unknown) {
                    if (isMounted) {
                        const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
                        setError(msg);
                    }
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [code, elementId]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code', err);
        }
    }, [code]);

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-border-default shadow-2xl shadow-black/20 bg-surface/80 backdrop-blur-sm group/block" data-testid="mermaid-block">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-highlight border-b border-border-default">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-[11px] font-mono text-fg-muted uppercase tracking-widest select-none">
                        MERMAID
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-surface border border-border-default rounded-lg p-0.5 mr-2">
                        <button
                            onClick={() => setViewMode('diagram')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                viewMode === 'diagram'
                                    ? 'bg-surface-highlight text-primary font-medium'
                                    : 'text-fg-muted hover:text-fg-secondary'
                            }`}
                            aria-label="View diagram"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Diagram</span>
                        </button>
                        <button
                            onClick={() => setViewMode('code')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                viewMode === 'code'
                                    ? 'bg-surface-highlight text-primary font-medium'
                                    : 'text-fg-muted hover:text-fg-secondary'
                            }`}
                            aria-label="View code"
                        >
                            <Code className="w-3.5 h-3.5" />
                            <span>Code</span>
                        </button>
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center p-1.5 rounded-md hover:bg-surface text-fg-muted hover:text-primary transition-all duration-200 focus:outline-none"
                        title="Copy to clipboard"
                        aria-label="Copy code"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-x-auto">
                {error ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Failed to render diagram: {error}</span>
                        </div>
                        <pre className="font-mono text-[13px] leading-6 bg-surface-highlight/50 p-3 rounded-lg overflow-x-auto text-fg-secondary">
                            <code>{code}</code>
                        </pre>
                    </div>
                ) : viewMode === 'code' ? (
                    <pre className="font-mono text-[13px] leading-6">
                        <div className="min-w-fit">
                            {lines.map((line, i) => (
                                <div key={i} className="table-row group">
                                    <span className="table-cell select-none text-right pr-5 w-10 text-fg-muted group-hover:text-fg-secondary transition-colors">
                                        {i + 1}
                                    </span>
                                    <span className="table-cell whitespace-pre text-fg-primary">
                                        {line}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </pre>
                ) : (
                    <div
                        className="mermaid-output flex justify-center items-center py-2"
                        data-testid="mermaid-svg-container"
                        dangerouslySetInnerHTML={{ __html: svgHtml }}
                    />
                )}
            </div>
        </div>
    );
};

export default MermaidBlock;
