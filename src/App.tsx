import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Menu,
  X,
  Code2,
  Terminal,
  BookOpen,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
} from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

// ─────────────────────────────────────────────
// MOCK FILE SYSTEM
// ─────────────────────────────────────────────

const mockFileSystem: FileNode[] = [
  {
    id: 'intro',
    name: 'Getting Started',
    type: 'folder',
    children: [
      {
        id: 'welcome',
        name: 'Welcome to React Mastery',
        type: 'file',
        content: `# Welcome to the Course

Welcome to the ultimate guide for modern React development. This platform is designed to track your progress as you move through the curriculum.

## How to Use This Platform

1. **Navigate** using the sidebar on the left
2. **Read** the content and study the code snippets
3. **Click "Mark as Complete"** at the bottom of each lesson

Each lesson builds on the last. Take your time, experiment with the code, and enjoy the journey.

## What You'll Learn

- **Components** — the building blocks of every React app
- **Hooks** — the modern way to manage state and side effects
- **Patterns** — real-world techniques used in production apps

Let's get started!`,
      },
      {
        id: 'setup',
        name: 'Environment Setup',
        type: 'file',
        content: `# Setting Up Your Environment

Before we write any code, we need the right tools installed.

## Prerequisites

- **Node.js** v18 or later
- A code editor (VS Code recommended)
- A terminal you're comfortable with

## Create Your First Project

\`\`\`bash
npx create-react-app my-app --template typescript
cd my-app
npm start
\`\`\`

This will scaffold a new React project with TypeScript support and start the dev server on \`localhost:3000\`.

## Project Structure

After setup, your project looks like this:

\`\`\`bash
my-app/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── public/
├── package.json
└── tsconfig.json
\`\`\`

The \`src/\` directory is where all your application code lives.`,
      },
    ],
  },
  {
    id: 'ch1',
    name: 'Chapter 1: Components',
    type: 'folder',
    children: [
      {
        id: 'func-comp',
        name: 'Functional Components',
        type: 'file',
        content: `# Functional Components

React components are JavaScript functions that return JSX — a syntax extension that looks like HTML but compiles to \`React.createElement()\` calls.

## The Basic Syntax

\`\`\`javascript
function Welcome({ name }) {
  return (
    <div className="card">
      <h1>Hello, {name}</h1>
      <p>Welcome to our application.</p>
    </div>
  );
}

// Arrow function variant
const Greeting = ({ message }) => (
  <span className="greeting">{message}</span>
);
\`\`\`

Notice how we **destructured** the \`name\` prop directly in the function parameters. This is idiomatic React.

## Composition

Components can be nested inside other components:

\`\`\`javascript
function App() {
  return (
    <main>
      <Welcome name="Developer" />
      <Greeting message="Ready to learn?" />
    </main>
  );
}
\`\`\`

This is the power of composition — small, focused components combined into complex interfaces.`,
      },
      {
        id: 'props-state',
        name: 'Props vs State',
        type: 'file',
        content: `# Props vs State

Understanding the difference between props and state is fundamental.

## Quick Comparison

- **Props** — data passed *down* from a parent. Immutable within the component.
- **State** — data managed *internally*. Mutable via setter functions.

## State Example

\`\`\`javascript
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div className="counter">
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};
\`\`\`

## The Golden Rule

> **If a parent needs to know about it, lift the state up. If only this component cares, keep it local.**

This principle guides 90% of state architecture decisions in React.`,
      },
      {
        id: 'conditional',
        name: 'Conditional Rendering',
        type: 'file',
        content: `# Conditional Rendering

React gives you multiple patterns for rendering content conditionally.

## Ternary Operator

\`\`\`javascript
function Status({ isOnline }) {
  return (
    <div className="status">
      {isOnline ? (
        <span className="online">● Online</span>
      ) : (
        <span className="offline">● Offline</span>
      )}
    </div>
  );
}
\`\`\`

## Logical AND (&&)

Use this when you only want to render something *if* a condition is true:

\`\`\`javascript
function Notifications({ count }) {
  return (
    <div>
      <h2>Dashboard</h2>
      {count > 0 && (
        <div className="badge">
          {count} new notifications
        </div>
      )}
    </div>
  );
}
\`\`\`

## Early Return

For more complex conditions, return early:

\`\`\`javascript
function UserProfile({ user, isLoading }) {
  if (isLoading) return <Skeleton />;
  if (!user) return <p>No user found.</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\``,
      },
    ],
  },
  {
    id: 'ch2',
    name: 'Chapter 2: Hooks',
    type: 'folder',
    children: [
      {
        id: 'use-effect',
        name: 'useEffect Deep Dive',
        type: 'file',
        content: `# The useEffect Hook

\`useEffect\` handles side effects — things that happen *outside* of rendering, like API calls, subscriptions, or DOM mutations.

## Fetching Data

\`\`\`javascript
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []); // Empty array = run once on mount

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Cleanup Functions

Always clean up subscriptions to prevent memory leaks:

\`\`\`javascript
useEffect(() => {
  const handler = (e) => console.log(e.key);
  window.addEventListener('keydown', handler);

  // Cleanup runs when component unmounts
  return () => window.removeEventListener('keydown', handler);
}, []);
\`\`\``,
      },
      {
        id: 'custom-hooks',
        name: 'Building Custom Hooks',
        type: 'file',
        content: `# Custom Hooks

Custom hooks let you extract and reuse stateful logic across components.

## The useWindowSize Hook

\`\`\`javascript
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
\`\`\`

## Using It

\`\`\`javascript
function ResponsiveLayout() {
  const { width } = useWindowSize();

  return (
    <div>
      {width > 768 ? (
        <DesktopNav />
      ) : (
        <MobileNav />
      )}
    </div>
  );
}
\`\`\`

## The Rules

1. Custom hooks **must** start with \`use\`
2. They can call other hooks
3. They follow the same rules as regular hooks (no conditional calls)`,
      },
    ],
  },
  {
    id: 'ch3',
    name: 'Chapter 3: Patterns',
    type: 'folder',
    children: [
      {
        id: 'composition',
        name: 'Composition Patterns',
        type: 'file',
        content: `# Composition Patterns

Composition is React's primary mechanism for code reuse — not inheritance.

## The Children Pattern

\`\`\`javascript
function Card({ children, title }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// Usage
function App() {
  return (
    <Card title="User Settings">
      <p>Manage your account preferences here.</p>
      <button>Save Changes</button>
    </Card>
  );
}
\`\`\`

## Render Props

Pass a function as a prop to control what gets rendered:

\`\`\`javascript
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);

  if (!data) return <p>Loading...</p>;
  return render(data);
}

// Usage
<DataFetcher
  url="/api/users"
  render={(users) => (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  )}
/>
\`\`\`

This pattern gives the parent full control over the rendered output.`,
      },
      {
        id: 'perf',
        name: 'Performance Optimization',
        type: 'file',
        content: `# Performance Optimization

React is fast by default, but there are techniques to make it faster.

## React.memo

Prevents re-renders when props haven't changed:

\`\`\`javascript
const ExpensiveList = React.memo(({ items }) => {
  console.log('Rendering list...');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
\`\`\`

## useMemo & useCallback

\`\`\`javascript
function SearchResults({ query, data }) {
  // Only re-compute when query or data changes
  const filtered = useMemo(
    () => data.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ),
    [query, data]
  );

  // Stable function reference for child components
  const handleSelect = useCallback((id) => {
    console.log('Selected:', id);
  }, []);

  return (
    <ul>
      {filtered.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
}
\`\`\`

## Key Takeaways

- **Don't optimize prematurely** — measure first with React DevTools Profiler
- **Memoize** expensive computations with \`useMemo\`
- **Stabilize** callbacks with \`useCallback\` when passing to memoized children
- **Split** large components so React can re-render less`,
      },
    ],
  },
];

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

const flattenFileSystem = (nodes: FileNode[]): FileNode[] => {
  const flat: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      flat.push(node);
    } else if (node.children) {
      flat.push(...flattenFileSystem(node.children));
    }
  }
  return flat;
};

const flatFiles = flattenFileSystem(mockFileSystem);

const STORAGE_KEY = 'devtutorials-completed';

const loadCompleted = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// ─────────────────────────────────────────────
// SYNTAX HIGHLIGHTER (simulated, JS/React)
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
    // Single-line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // String (double-quoted)
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

    // String (single-quoted)
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

    // Template literal
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

    // JSX tags: <Component or </div>
    if (code[i] === '<' && (code[i + 1]?.match(/[a-zA-Z/]/) ?? false)) {
      let end = code.indexOf('>', i);
      if (end === -1) end = code.length - 1;
      tokens.push({ type: 'tag', value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Number
    if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_]/.test(code[i - 1]))) {
      let end = i;
      while (end < code.length && /[0-9.]/.test(code[end])) end++;
      tokens.push({ type: 'number', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Word (identifiers / keywords)
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

    // Operators
    if ('=+-*/%!&|?:'.includes(code[i])) {
      tokens.push({ type: 'operator', value: code[i] });
      i++;
      continue;
    }

    // Punctuation
    if ('(){}[];,.'.includes(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }

    // Whitespace / other
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
  // Remove trailing empty line if present
  if (lines[lines.length - 1]?.trim() === '') lines.pop();

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/20 bg-slate-900/80 backdrop-blur-sm">
      {/* Title bar */}
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
      {/* Code body */}
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

// ─────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────

const renderInline = (text: string): React.ReactNode => {
  // Process bold, inline code, italic
  const parts: React.ReactNode[] = [];
  // Use a regex to split bold (**...**), inline code (`...`), and italic (*...*)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith('**') && m.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {m.slice(2, -2)}
        </strong>
      );
    } else if (m.startsWith('`') && m.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[13px] font-mono">
          {m.slice(1, -1)}
        </code>
      );
    } else if (m.startsWith('*') && m.endsWith('*')) {
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

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1 text-slate-300 leading-7">
      {parts.map((part, index) => {
        // Code block
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          if (match) {
            return <CodeBlock key={index} language={match[1]} code={match[2]} />;
          }
          return null;
        }

        // Regular text
        return (
          <div key={index}>
            {part.split('\n').map((line, lineIdx) => {
              // Headers
              if (line.startsWith('### '))
                return (
                  <h3 key={lineIdx} className="text-lg font-semibold text-slate-100 mt-8 mb-3">
                    {renderInline(line.slice(4))}
                  </h3>
                );
              if (line.startsWith('## '))
                return (
                  <h2 key={lineIdx} className="text-xl font-semibold text-indigo-400 mt-10 mb-4">
                    {renderInline(line.slice(3))}
                  </h2>
                );
              if (line.startsWith('# '))
                return (
                  <h1 key={lineIdx} className="text-3xl font-bold text-white mb-6 mt-2 pb-3 border-b border-slate-800/60">
                    {renderInline(line.slice(2))}
                  </h1>
                );

              // Blockquote
              if (line.startsWith('> '))
                return (
                  <blockquote
                    key={lineIdx}
                    className="pl-4 border-l-2 border-indigo-500/50 text-slate-400 italic my-4"
                  >
                    {renderInline(line.slice(2))}
                  </blockquote>
                );

              // Unordered list
              if (line.startsWith('- ') || line.startsWith('* '))
                return (
                  <li key={lineIdx} className="ml-5 list-disc marker:text-indigo-500/70 mb-1.5">
                    {renderInline(line.slice(2))}
                  </li>
                );

              // Ordered list
              if (/^\d+\.\s/.test(line))
                return (
                  <li key={lineIdx} className="ml-5 list-decimal marker:text-indigo-500/70 mb-1.5">
                    {renderInline(line.replace(/^\d+\.\s/, ''))}
                  </li>
                );

              // Empty line
              if (line.trim() === '') return <div key={lineIdx} className="h-2" />;

              // Paragraph
              return (
                <p key={lineIdx} className="mb-2 text-slate-300">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// SIDEBAR ITEM (recursive)
// ─────────────────────────────────────────────

interface SidebarItemProps {
  node: FileNode;
  level: number;
  activeFileId: string;
  completedFiles: string[];
  expandedFolders: string[];
  searchQuery: string;
  onSelectFile: (id: string) => void;
  onToggleFolder: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  node, level, activeFileId, completedFiles, expandedFolders, searchQuery, onSelectFile, onToggleFolder,
}) => {
  if (node.type === 'folder') {
    const isExpanded = expandedFolders.includes(node.id) || searchQuery.length > 0;

    // If searching, check if any child file matches
    if (searchQuery) {
      const hasMatch = flattenFileSystem(node.children || []).some((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!hasMatch) return null;
    }

    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.id)}
          aria-expanded={isExpanded}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer group"
          style={{ paddingLeft: `${level * 14 + 12}px` }}
        >
          <span className="mr-2 text-slate-500 group-hover:text-slate-400 transition-colors">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <Folder size={14} className="mr-2 text-indigo-400/70" />
          <span className="truncate">{node.name}</span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {node.children?.map((child) => (
            <SidebarItem
              key={child.id}
              node={child}
              level={level + 1}
              activeFileId={activeFileId}
              completedFiles={completedFiles}
              expandedFolders={expandedFolders}
              searchQuery={searchQuery}
              onSelectFile={onSelectFile}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      </div>
    );
  }

  // File node
  if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  const isActive = activeFileId === node.id;
  const isCompleted = completedFiles.includes(node.id);

  return (
    <button
      onClick={() => onSelectFile(node.id)}
      aria-current={isActive ? 'page' : undefined}
      className={`
        flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-all cursor-pointer group
        ${isActive
          ? 'bg-indigo-500/10 text-indigo-300 shadow-[inset_2px_0_0_0] shadow-indigo-500'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'}
      `}
      style={{ paddingLeft: `${level * 14 + 12}px` }}
    >
      <div className="flex items-center min-w-0">
        <FileText
          size={14}
          className={`mr-2 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'} transition-colors`}
        />
        <span className="truncate">{node.name}</span>
      </div>
      {isCompleted && (
        <CheckCircle2
          size={14}
          className="shrink-0 ml-2 text-emerald-500"
        />
      )}
    </button>
  );
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function App() {
  const [activeFileId, setActiveFileId] = useState('welcome');
  const [completedFiles, setCompletedFiles] = useState<string[]>(loadCompleted);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['intro']);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist completed files
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedFiles));
  }, [completedFiles]);

  // Scroll to top on file change
  useEffect(() => {
    document.getElementById('content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFileId]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') navigate('next');
      else if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId]);

  const activeFile = useMemo(
    () => flatFiles.find((f) => f.id === activeFileId) || flatFiles[0],
    [activeFileId]
  );

  const currentIndex = flatFiles.findIndex((f) => f.id === activeFileId);
  const progress = Math.round((completedFiles.length / flatFiles.length) * 100);

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      const idx = flatFiles.findIndex((f) => f.id === activeFileId);
      if (direction === 'next' && idx < flatFiles.length - 1) {
        setActiveFileId(flatFiles[idx + 1].id);
      } else if (direction === 'prev' && idx > 0) {
        setActiveFileId(flatFiles[idx - 1].id);
      }
    },
    [activeFileId]
  );

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  }, []);

  const selectFile = useCallback((id: string) => {
    setActiveFileId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const handleComplete = useCallback(() => {
    setCompletedFiles((prev) => {
      if (prev.includes(activeFileId)) return prev;
      return [...prev, activeFileId];
    });
    // Advance to next
    const idx = flatFiles.findIndex((f) => f.id === activeFileId);
    if (idx < flatFiles.length - 1) {
      setActiveFileId(flatFiles[idx + 1].id);
    }
  }, [activeFileId]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ──── SIDEBAR ──── */}
      <aside
        className={`
          fixed md:relative z-30 flex flex-col w-72 h-full bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-800/60 transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!isSidebarOpen && 'md:w-0 md:border-0 md:overflow-hidden'}
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Terminal size={16} className="text-indigo-400" />
              </div>
              <h1 className="font-bold text-base tracking-tight text-white">
                DevTutorials<span className="text-indigo-400">.io</span>
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Course Progress</span>
              <span className="text-indigo-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Filter lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg py-2 pl-8 pr-3 text-xs
                focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
                transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* File tree */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
          {mockFileSystem.map((node) => (
            <SidebarItem
              key={node.id}
              node={node}
              level={0}
              activeFileId={activeFileId}
              completedFiles={completedFiles}
              expandedFolders={expandedFolders}
              searchQuery={searchQuery}
              onSelectFile={selectFile}
              onToggleFolder={toggleFolder}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">John Doe</div>
              <div className="text-[11px] text-slate-500">Pro Member</div>
            </div>
            <Sparkles size={14} className="text-amber-400/60" />
          </div>
        </div>
      </aside>

      {/* ──── MAIN CONTENT ──── */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <Menu size={18} /> : <BookOpen size={18} />}
            </button>
            <nav className="hidden sm:flex text-sm text-slate-500 items-center gap-1.5">
              <span>Course</span>
              <ChevronRight size={12} className="text-slate-600" />
              <span className="text-slate-200 font-medium truncate max-w-[240px]">
                {activeFile.name}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-2 hidden sm:inline tabular-nums">
              {completedFiles.length}/{flatFiles.length} completed
            </span>
            <div className="h-5 w-px bg-slate-800 mx-1.5 hidden sm:block" />
            <button
              onClick={() => navigate('prev')}
              disabled={currentIndex === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Previous lesson"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => navigate('next')}
              disabled={currentIndex === flatFiles.length - 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Next lesson"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div id="content-scroll" className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-6 py-12 md:px-10">
            {/* Meta badge */}
            <div className="mb-8 flex items-center gap-2 text-indigo-400/80 text-xs font-medium uppercase tracking-widest">
              <Code2 size={14} />
              <span>Lesson {currentIndex + 1} of {flatFiles.length}</span>
            </div>

            {/* Article */}
            <article>
              <MarkdownRenderer content={activeFile.content || ''} />
            </article>

            {/* Action footer */}
            <div className="mt-16 pt-8 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-slate-600 text-xs">
                Lesson {currentIndex + 1} of {flatFiles.length}
              </div>

              <button
                onClick={handleComplete}
                className={`
                  flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer
                  ${completedFiles.includes(activeFileId)
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0'}
                `}
              >
                {completedFiles.includes(activeFileId) ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Trophy size={18} />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>
            </div>

            {/* Next lesson teaser */}
            {completedFiles.includes(activeFileId) && currentIndex < flatFiles.length - 1 && (
              <button
                onClick={() => navigate('next')}
                className="mt-6 w-full p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl cursor-pointer
                  hover:border-indigo-500/30 group transition-all text-left"
              >
                <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Up Next</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {flatFiles[currentIndex + 1].name}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>
            )}

            {/* Completion celebration */}
            {progress === 100 && (
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">Course Complete!</h3>
                <p className="text-slate-400 text-sm">
                  You've completed all lessons. You're now a React pro.
                </p>
              </div>
            )}

            <div className="h-20" />
          </div>
        </div>
      </main>
    </div>
  );
}