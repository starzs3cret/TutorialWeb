import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Menu,
  X,
  Play,
  Code2,
  Terminal,
  BookOpen,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Search
} from 'lucide-react';

/**
 * MOCK FILE SYSTEM DATA
 * In a real app, this would be fetched from a backend or file system reader.
 */
const mockFileSystem = [
  {
    id: 'root',
    name: 'Introduction',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'welcome',
        name: 'Welcome to React Mastery',
        type: 'file',
        content: `# Welcome to the Course

Welcome to the ultimate guide for modern React development. This platform is designed to track your progress as you move through the file system.

## How to use this platform
1. **Navigate** using the sidebar on the left.
2. **Read** the content and study the code snippets.
3. **Click "Mark as Complete"** at the bottom to track progress.

Let's get started!`
      },
      {
        id: 'setup',
        name: 'Environment Setup',
        type: 'file',
        content: `# Setting Up Your Environment

Before we code, we need Node.js installed.

## Installation
Run the following command in your terminal:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

This will start the development server on localhost:3000.`
      }
    ]
  },
  {
    id: 'ch1',
    name: 'Chapter 1: Components',
    type: 'folder',
    isOpen: false,
    children: [
      {
        id: 'func-comp',
        name: 'Functional Components',
        type: 'file',
        content: `# Functional Components

React components are just JavaScript functions that return JSX.

## The Basic Syntax

\`\`\`javascript
function Welcome({ name }) {
  return (
    <div className="p-4 bg-blue-100">
      <h1>Hello, {name}</h1>
    </div>
  );
}
\`\`\`

Notice how we destructured the \`name\` prop directly in the arguments.`
      },
      {
        id: 'props-state',
        name: 'Props vs State',
        type: 'file',
        content: `# Props vs State

Understanding the difference is crucial.

* **Props**: Passed down (Immutable)
* **State**: Managed internally (Mutable)

## State Example

\`\`\`javascript
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count is {count}
    </button>
  );
};
\`\`\`
`
      }
    ]
  },
  {
    id: 'ch2',
    name: 'Chapter 2: Hooks',
    type: 'folder',
    isOpen: false,
    children: [
      {
        id: 'use-effect',
        name: 'useEffect Deep Dive',
        type: 'file',
        content: `# The useEffect Hook

This hook handles side effects like data fetching or subscriptions.

## Fetching Data

\`\`\`javascript
useEffect(() => {
  const fetchData = async () => {
    const data = await api.get('/users');
    setUsers(data);
  };
  
  fetchData();
}, []); // Empty dependency array run once
\`\`\`
`
      },
      {
        id: 'custom-hooks',
        name: 'Building Custom Hooks',
        type: 'file',
        content: `# Custom Hooks

Extract logic into reusable functions.

\`\`\`javascript
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
\`\`\`
`
      }
    ]
  }
];

// Flatten filesystem for easier navigation logic
const flattenFileSystem = (nodes, parentPath = '') => {
  let flat = [];
  nodes.forEach(node => {
    if (node.type === 'file') {
      flat.push({ ...node, path: `${parentPath}/${node.name}` });
    } else if (node.children) {
      flat = [...flat, ...flattenFileSystem(node.children, `${parentPath}/${node.name}`)];
    }
  });
  return flat;
};

const flatFiles = flattenFileSystem(mockFileSystem);

/**
 * COMPONENT: CodeBlock
 * Renders colorful code snippets
 */
const CodeBlock = ({ language, code }) => {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-700 shadow-xl bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="text-xs text-slate-400 font-mono uppercase">{language || 'code'}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          <code className="text-slate-200">
            {code.split('\n').map((line, i) => (
              <div key={i} className="table-row">
                <span className="table-cell select-none text-slate-600 text-right pr-4 w-8">{i + 1}</span>
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

/**
 * COMPONENT: MarkdownRenderer
 * Simple custom parser to avoid external heavy dependencies in this demo
 */
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-slate-300">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract language and code
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          if (match) {
            return <CodeBlock key={index} language={match[1]} code={match[2]} />;
          }
          return null;
        } else {
          // Render regular text (simplified)
          return (
            <div key={index}>
              {part.split('\n').map((line, lineIdx) => {
                if (line.startsWith('# ')) return <h1 key={lineIdx} className="text-3xl font-bold text-white mb-6 mt-8 pb-2 border-b border-slate-800">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={lineIdx} className="text-2xl font-semibold text-indigo-400 mb-4 mt-8">{line.replace('## ', '')}</h2>;
                if (line.startsWith('* ')) return <li key={lineIdx} className="ml-4 list-disc marker:text-indigo-500 mb-2">{line.replace('* ', '')}</li>;
                if (line.match(/^\d\./)) return <li key={lineIdx} className="ml-4 list-decimal marker:text-indigo-500 mb-2">{line.replace(/^\d\.\s/, '')}</li>;
                if (line.trim() === '') return <div key={lineIdx} className="h-2" />;
                return <p key={lineIdx} className="mb-2 leading-7 text-slate-300">{line}</p>;
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

/**
 * MAIN COMPONENT: App
 */
export default function App() {
  const [activeFileId, setActiveFileId] = useState('welcome');
  const [completedFiles, setCompletedFiles] = useState(['welcome']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(['root', 'ch1']);
  const [searchQuery, setSearchQuery] = useState('');

  // Find active file object
  const activeFile = useMemo(() =>
    flatFiles.find(f => f.id === activeFileId) || flatFiles[0]
    , [activeFileId]);

  // Calculate Progress
  const progress = Math.round((completedFiles.length / flatFiles.length) * 100);

  // Toggle Folder
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  // Mark current as complete and go next
  const handleComplete = () => {
    if (!completedFiles.includes(activeFileId)) {
      setCompletedFiles([...completedFiles, activeFileId]);
    }

    // Find next file
    const currentIndex = flatFiles.findIndex(f => f.id === activeFileId);
    if (currentIndex < flatFiles.length - 1) {
      setActiveFileId(flatFiles[currentIndex + 1].id);
    }
  };

  // Navigation Logic
  const navigate = (direction) => {
    const currentIndex = flatFiles.findIndex(f => f.id === activeFileId);
    if (direction === 'next' && currentIndex < flatFiles.length - 1) {
      setActiveFileId(flatFiles[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveFileId(flatFiles[currentIndex - 1].id);
    }
  };

  /**
   * RECURSIVE SIDEBAR RENDERER
   */
  const renderTree = (nodes, level = 0) => {
    return nodes.map(node => {
      // Filter if searching
      if (searchQuery && node.type === 'file' && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }

      // If folder doesn't match search but children might, we need to check children
      // But for simplicity in this demo, we just do basic file filtering

      if (node.type === 'folder') {
        const isExpanded = expandedFolders.includes(node.id) || searchQuery.length > 0;
        return (
          <div key={node.id} className="select-none">
            <div
              onClick={() => toggleFolder(node.id)}
              className={`
                flex items-center px-4 py-2 cursor-pointer transition-colors
                text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50
              `}
              style={{ paddingLeft: `${level * 12 + 16}px` }}
            >
              <span className="mr-2">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <Folder size={14} className="mr-2 text-indigo-400" />
              {node.name}
            </div>
            {isExpanded && (
              <div className="border-l border-slate-800 ml-6">
                {renderTree(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const isActive = activeFileId === node.id;
        const isCompleted = completedFiles.includes(node.id);

        return (
          <div
            key={node.id}
            onClick={() => {
              setActiveFileId(node.id);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={`
              flex items-center justify-between px-4 py-2 cursor-pointer transition-all border-l-2
              text-sm
              ${isActive
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
            style={{ paddingLeft: `${level * 12 + 16}px` }}
          >
            <div className="flex items-center">
              <FileText size={14} className={`mr-2 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              {node.name}
            </div>
            {isCompleted && <CheckCircle size={12} className="text-emerald-500" />}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative z-30 flex flex-col w-72 h-full bg-slate-900 border-r border-slate-800
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!isSidebarOpen && 'md:w-0 md:opacity-0 md:overflow-hidden'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <Terminal size={24} />
            <h1 className="font-bold text-lg tracking-tight text-white">DevTutorials<span className="text-indigo-500">.io</span></h1>
          </div>

          {/* Global Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Course Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Filter lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-8 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {renderTree(mockFileSystem)}
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">John Doe</div>
              <div className="text-xs text-slate-500">Pro Member</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-950 relative">

        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              {isSidebarOpen ? <Menu size={20} /> : <BookOpen size={20} />}
            </button>
            <nav className="hidden sm:flex text-sm text-slate-500 items-center gap-2">
              <span>Course</span>
              <ChevronRight size={14} />
              <span className="text-slate-200 truncate max-w-[200px]">{activeFile.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-2 hidden sm:inline">
              {completedFiles.length} / {flatFiles.length} Completed
            </span>
            <div className="h-8 w-px bg-slate-800 mx-2 hidden sm:block"></div>
            <button
              onClick={() => navigate('prev')}
              disabled={flatFiles.findIndex(f => f.id === activeFileId) === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => navigate('next')}
              disabled={flatFiles.findIndex(f => f.id === activeFileId) === flatFiles.length - 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="max-w-4xl mx-auto px-6 py-10 md:px-10">

            {/* File Meta */}
            <div className="mb-8 flex items-center gap-2 text-indigo-400 text-sm font-medium uppercase tracking-wider">
              <Code2 size={16} />
              <span>Markdown Preview</span>
            </div>

            {/* Rendered Content */}
            <article className="prose prose-invert prose-slate max-w-none">
              <MarkdownRenderer content={activeFile.content} />
            </article>

            {/* Action Footer */}
            <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-slate-500 text-sm">
                Last updated: Just now
              </div>

              <button
                onClick={handleComplete}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all shadow-lg
                  ${completedFiles.includes(activeFileId)
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 hover:-translate-y-0.5'}
                `}
              >
                {completedFiles.includes(activeFileId) ? (
                  <>
                    <CheckCircle size={18} />
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

            {/* Next Lesson Teaser */}
            {completedFiles.includes(activeFileId) && flatFiles.findIndex(f => f.id === activeFileId) < flatFiles.length - 1 && (
              <div
                onClick={() => navigate('next')}
                className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-indigo-500/50 group transition-colors"
              >
                <div className="text-xs text-slate-500 mb-1">Up Next</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {flatFiles[flatFiles.findIndex(f => f.id === activeFileId) + 1].name}
                  </span>
                  <ArrowRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            <div className="h-20" /> {/* Bottom spacer */}
          </div>
        </div>

      </main>
    </div>
  );
}