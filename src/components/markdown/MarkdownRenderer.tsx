import React, { useState, useCallback } from 'react';
import CodeBlock from './CodeBlock';

// ─────────────────────────────────────────────
// INLINE RENDERER — handles bold, italic, code,
// strikethrough, links, images
// ─────────────────────────────────────────────

const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    // Order matters: images before links, bold before italic
    const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const m = match[0];

        // Image: ![alt](src)
        if (m.startsWith('![')) {
            const alt = match[2];
            const src = match[3];
            parts.push(
                <img
                    key={match.index}
                    src={src}
                    alt={alt}
                    className="max-w-full rounded-lg my-2 border border-slate-800/40"
                />
            );
        }
        // Link: [text](url)
        else if (m.startsWith('[') && m.includes('](')) {
            const linkText = match[4];
            const href = match[5];
            parts.push(
                <a
                    key={match.index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 decoration-indigo-500/40 hover:decoration-indigo-400/60 transition-colors"
                >
                    {linkText}
                </a>
            );
        }
        // Bold
        else if (m.startsWith('**') && m.endsWith('**')) {
            parts.push(
                <strong key={match.index} className="font-semibold text-white">
                    {m.slice(2, -2)}
                </strong>
            );
        }
        // Strikethrough
        else if (m.startsWith('~~') && m.endsWith('~~')) {
            parts.push(
                <del key={match.index} className="text-slate-500 line-through">
                    {m.slice(2, -2)}
                </del>
            );
        }
        // Inline code
        else if (m.startsWith('`') && m.endsWith('`')) {
            parts.push(
                <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[13px] font-mono">
                    {m.slice(1, -1)}
                </code>
            );
        }
        // Italic
        else if (m.startsWith('*') && m.endsWith('*')) {
            parts.push(
                <em key={match.index} className="text-slate-300 italic">
                    {m.slice(1, -1)}
                </em>
            );
        }
        lastIndex = match.index + m.length;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
};

// ─────────────────────────────────────────────
// TABLE PARSER
// ─────────────────────────────────────────────

const parseTableRow = (line: string): string[] => {
    return line
        .split('|')
        .slice(1, -1) // remove leading/trailing empty strings from split
        .map((cell) => cell.trim());
};

const isTableSeparator = (line: string): boolean => {
    return /^\|[\s:-]+\|/.test(line) && line.replace(/[\s|:-]/g, '').length === 0;
};

interface TableData {
    headers: string[];
    rows: string[][];
    alignments: ('left' | 'center' | 'right')[];
}

const parseTableAlignments = (separatorLine: string): ('left' | 'center' | 'right')[] => {
    return parseTableRow(separatorLine).map((cell) => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
    });
};

const TableRenderer: React.FC<{ table: TableData }> = ({ table }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
            <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/50">
                    {table.headers.map((h, i) => (
                        <th
                            key={i}
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                            style={{ textAlign: table.alignments[i] || 'left' }}
                        >
                            {renderInline(h)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
                {table.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                        {row.map((cell, ci) => (
                            <td
                                key={ci}
                                className="px-4 py-3 text-slate-300"
                                style={{ textAlign: table.alignments[ci] || 'left' }}
                            >
                                {renderInline(cell)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// ─────────────────────────────────────────────
// CHECKLIST ITEM
// ─────────────────────────────────────────────

const ChecklistItem: React.FC<{ checked: boolean; text: string; onToggle?: () => void }> = ({ checked, text, onToggle }) => (
    <li className="flex items-start gap-3 ml-1 mb-2 list-none">
        <button
            onClick={onToggle}
            className={`mt-1 w-4.5 h-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
                ${checked
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'border-slate-600 hover:border-indigo-500/50 bg-transparent'}`}
        >
            {checked && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
        <span className={`${checked ? 'line-through text-slate-500' : 'text-slate-300'} transition-colors`}>
            {renderInline(text)}
        </span>
    </li>
);

// ─────────────────────────────────────────────
// MARKDOWN RENDERER — State-machine approach
// ─────────────────────────────────────────────

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Checklist state (local to render instance)
    const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});

    const toggleChecklist = useCallback((lineKey: number) => {
        setChecklistState((prev) => ({ ...prev, [lineKey]: !prev[lineKey] }));
    }, []);

    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let globalLineKey = 0;

    while (i < lines.length) {
        const line = lines[i];

        // ── Code fence block ──
        if (line.trimStart().startsWith('```')) {
            const langMatch = line.trimStart().match(/^```(\w*)/);
            const language = langMatch?.[1] || '';
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // skip closing ```
            elements.push(<CodeBlock key={globalLineKey++} language={language} code={codeLines.join('\n')} />);
            continue;
        }

        // ── Table block ──
        if (line.includes('|') && line.trim().startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
            const headers = parseTableRow(line);
            const alignments = parseTableAlignments(lines[i + 1]);
            const rows: string[][] = [];
            i += 2;
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                rows.push(parseTableRow(lines[i]));
                i++;
            }
            elements.push(<TableRenderer key={globalLineKey++} table={{ headers, rows, alignments }} />);
            continue;
        }

        // ── Headings ──
        if (line.startsWith('#### ')) {
            elements.push(
                <h4 key={globalLineKey++} className="text-base font-semibold text-slate-200 mt-6 mb-2">
                    {renderInline(line.slice(5))}
                </h4>
            );
            i++; continue;
        }
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={globalLineKey++} className="text-lg font-semibold text-slate-100 mt-8 mb-3">
                    {renderInline(line.slice(4))}
                </h3>
            );
            i++; continue;
        }
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={globalLineKey++} className="text-xl font-semibold text-indigo-400 mt-10 mb-4">
                    {renderInline(line.slice(3))}
                </h2>
            );
            i++; continue;
        }
        if (line.startsWith('# ')) {
            elements.push(
                <h1 key={globalLineKey++} className="text-3xl font-bold text-white mb-6 mt-2 pb-3 border-b border-slate-800/60">
                    {renderInline(line.slice(2))}
                </h1>
            );
            i++; continue;
        }

        // ── Horizontal rule ──
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
            elements.push(
                <hr key={globalLineKey++} className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            );
            i++; continue;
        }

        // ── Blockquote ──
        if (line.startsWith('> ')) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].startsWith('> ')) {
                quoteLines.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <blockquote key={globalLineKey++} className="pl-4 border-l-2 border-indigo-500/50 text-slate-400 italic my-4 space-y-1">
                    {quoteLines.map((ql, qi) => <p key={qi}>{renderInline(ql)}</p>)}
                </blockquote>
            );
            continue;
        }

        // ── Checklist ──
        if (/^[-*]\s\[([ xX])\]\s/.test(line)) {
            const checkItems: { defaultChecked: boolean; text: string; key: number }[] = [];
            while (i < lines.length && /^[-*]\s\[([ xX])\]\s/.test(lines[i])) {
                const checkMatch = lines[i].match(/^[-*]\s\[([ xX])\]\s(.*)$/);
                if (checkMatch) {
                    const key = globalLineKey++;
                    const defaultChecked = checkMatch[1].toLowerCase() === 'x';
                    // Initialize state on first encounter
                    if (checklistState[key] === undefined && defaultChecked) {
                        setChecklistState((prev) => ({ ...prev, [key]: true }));
                    }
                    checkItems.push({
                        defaultChecked,
                        text: checkMatch[2],
                        key,
                    });
                }
                i++;
            }
            elements.push(
                <ul key={`checklist-${checkItems[0]?.key}`} className="my-3 space-y-0.5">
                    {checkItems.map((item) => (
                        <ChecklistItem
                            key={item.key}
                            checked={checklistState[item.key] ?? item.defaultChecked}
                            text={item.text}
                            onToggle={() => toggleChecklist(item.key)}
                        />
                    ))}
                </ul>
            );
            continue;
        }

        // ── Unordered list ──
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const listItems: string[] = [];
            while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
                listItems.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <ul key={globalLineKey++} className="my-3 ml-5 space-y-1.5">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="list-disc marker:text-indigo-500/70">
                            {renderInline(item)}
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // ── Ordered list ──
        if (/^\d+\.\s/.test(line)) {
            const listItems: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                listItems.push(lines[i].replace(/^\d+\.\s/, ''));
                i++;
            }
            elements.push(
                <ol key={globalLineKey++} className="my-3 ml-5 space-y-1.5">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="list-decimal marker:text-indigo-500/70">
                            {renderInline(item)}
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        // ── Empty line ──
        if (line.trim() === '') {
            elements.push(<div key={globalLineKey++} className="h-2" />);
            i++; continue;
        }

        // ── Paragraph ──
        elements.push(
            <p key={globalLineKey++} className="mb-2 text-slate-300 leading-7">
                {renderInline(line)}
            </p>
        );
        i++;
    }

    return (
        <div className="space-y-1 text-slate-300 leading-7">
            {elements}
        </div>
    );
};

export default MarkdownRenderer;
