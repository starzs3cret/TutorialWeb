import React, { useMemo } from 'react';

// ─────────────────────────────────────────────
// SYNTAX HIGHLIGHTER (lightweight, zero-dep)
// ─────────────────────────────────────────────

const KEYWORDS = new Set([
    'import', 'export', 'from', 'default', 'const', 'let', 'var',
    'function', 'return', 'if', 'else', 'for', 'while', 'switch',
    'case', 'break', 'new', 'class', 'extends', 'async', 'await',
    'try', 'catch', 'throw', 'typeof', 'instanceof', 'of', 'in',
]);

const BUILTINS = new Set([
    'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef',
    'useContext', 'useReducer', 'React', 'console', 'window',
    'document', 'fetch', 'Promise', 'Array', 'Object', 'JSON',
    'Math', 'null', 'undefined', 'true', 'false',
]);

interface Token {
    type: 'keyword' | 'builtin' | 'string' | 'comment' | 'tag' | 'number' | 'operator' | 'punctuation' | 'text';
    value: string;
}

const tokenize = (code: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < code.length) {
        if (code[i] === '/' && code[i + 1] === '/') {
            let end = code.indexOf('\n', i);
            if (end === -1) end = code.length;
            tokens.push({ type: 'comment', value: code.slice(i, end) });
            i = end;
            continue;
        }

        if (code[i] === '"') {
            let end = i + 1;
            while (end < code.length && code[end] !== '"') {
                if (code[end] === '\\') end++;
                end++;
            }
            tokens.push({ type: 'string', value: code.slice(i, end + 1) });
            i = end + 1;
            continue;
        }

        if (code[i] === "'") {
            let end = i + 1;
            while (end < code.length && code[end] !== "'") {
                if (code[end] === '\\') end++;
                end++;
            }
            tokens.push({ type: 'string', value: code.slice(i, end + 1) });
            i = end + 1;
            continue;
        }

        if (code[i] === '`') {
            let end = i + 1;
            while (end < code.length && code[end] !== '`') {
                if (code[end] === '\\') end++;
                end++;
            }
            tokens.push({ type: 'string', value: code.slice(i, end + 1) });
            i = end + 1;
            continue;
        }

        if (code[i] === '<' && (code[i + 1]?.match(/[a-zA-Z/]/) ?? false)) {
            let end = code.indexOf('>', i);
            if (end === -1) end = code.length - 1;
            tokens.push({ type: 'tag', value: code.slice(i, end + 1) });
            i = end + 1;
            continue;
        }

        if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_]/.test(code[i - 1]))) {
            let end = i;
            while (end < code.length && /[0-9.]/.test(code[end])) end++;
            tokens.push({ type: 'number', value: code.slice(i, end) });
            i = end;
            continue;
        }

        if (/[a-zA-Z_$]/.test(code[i])) {
            let end = i;
            while (end < code.length && /[a-zA-Z0-9_$]/.test(code[end])) end++;
            const word = code.slice(i, end);
            if (KEYWORDS.has(word)) {
                tokens.push({ type: 'keyword', value: word });
            } else if (BUILTINS.has(word)) {
                tokens.push({ type: 'builtin', value: word });
            } else {
                tokens.push({ type: 'text', value: word });
            }
            i = end;
            continue;
        }

        if ('=+-*/%!&|?:'.includes(code[i])) {
            tokens.push({ type: 'operator', value: code[i] });
            i++;
            continue;
        }

        if ('(){}[];,.'.includes(code[i])) {
            tokens.push({ type: 'punctuation', value: code[i] });
            i++;
            continue;
        }

        tokens.push({ type: 'text', value: code[i] });
        i++;
    }

    return tokens;
};

const TOKEN_COLORS: Record<Token['type'], string> = {
    keyword: 'text-violet-400',
    builtin: 'text-cyan-400',
    string: 'text-amber-300',
    comment: 'text-slate-500 italic',
    tag: 'text-emerald-400',
    number: 'text-orange-400',
    operator: 'text-pink-400',
    punctuation: 'text-slate-400',
    text: 'text-slate-200',
};

const SyntaxHighlighter: React.FC<{ code: string }> = ({ code }) => {
    const tokens = useMemo(() => tokenize(code), [code]);
    return (
        <>
            {tokens.map((token, i) => (
                <span key={i} className={TOKEN_COLORS[token.type]}>
                    {token.value}
                </span>
            ))}
        </>
    );
};

// ─────────────────────────────────────────────
// CODEBLOCK COMPONENT
// ─────────────────────────────────────────────

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const lines = code.split('\n');
    if (lines[lines.length - 1]?.trim() === '') lines.pop();

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/20 bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                    {language || 'code'}
                </span>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-[13px] leading-6">
                    <code>
                        {lines.map((line, i) => (
                            <div key={i} className="table-row group">
                                <span className="table-cell select-none text-right pr-5 w-10 text-slate-600 group-hover:text-slate-500 transition-colors">
                                    {i + 1}
                                </span>
                                <span className="table-cell whitespace-pre">
                                    <SyntaxHighlighter code={line} />
                                </span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeBlock;
