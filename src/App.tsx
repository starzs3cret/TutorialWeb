import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Award,
  Terminal
} from 'lucide-react';

// --- Types ---
type FileType = 'file' | 'folder';

interface FileSystemNode {
  id: string;
  title: string;
  type: FileType;
  content?: string;
  children?: FileSystemNode[];
}

interface FileSystemContextType {
  fileSystem: FileSystemNode[];
  activeFileId: string | null;
  expandedFolderIds: Set<string>;
  completedFileIds: Set<string>;
  isLoading: boolean;
  setActiveFileId: (id: string) => void;
  toggleFolder: (id: string) => void;
  markAsComplete: (id: string) => void;
  getFileById: (id: string) => FileSystemNode | null;
  progress: number;
}

// --- Mock Data ---
const mockFileSystem: FileSystemNode[] = [
  {
    id: 'root',
    title: 'Curriculum',
    type: 'folder',
    children: [
      {
        id: 'intro',
        title: '01. Introduction',
        type: 'folder',
        children: [
          {
            id: 'welcome',
            title: 'Welcome to the Course',
            type: 'file',
            content: `# Welcome to React Mastery
            
This course is designed to take you from *zero* to **hero**.

## What you will learn
- **Components** and Props
- **Hooks** (useState, useEffect)
- **Performance** Optimization

Let's get started!`
          },
          {
            id: 'setup',
            title: 'Environment Setup',
            type: 'file',
            content: `# Setting up your Environment

First, you need to install Node.js.

\`\`\`bash
npm install -g create-react-app
\`\`\`

Then create your project:
\`\`\`bash
npx create-react-app my-app
\`\`\`
`
          }
        ]
      },
      {
        id: 'hooks',
        title: '02. React Hooks',
        type: 'folder',
        children: [
          {
            id: 'usestate',
            title: 'The useState Hook',
            type: 'file',
            content: `# useState

State is the heart of React.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

It allows you to track changing data.
`
          },
          {
            id: 'useeffect',
            title: 'The useEffect Hook',
            type: 'file',
            content: `# useEffect

Side effects like data fetching happen here.

\`\`\`jsx
useEffect(() => {
  document.title = "Hello";
}, []);
\`\`\`
`
          }
        ]
      },
      {
        id: 'advanced',
        title: '03. Advanced Patterns',
        type: 'folder',
        children: [
          {
            id: 'hoc',
            title: 'Higher Order Components',
            type: 'file',
            content: `# Higher Order Components
                
A pattern for reusing component logic.
`
          }
        ]
      }
    ]
  }
];

// --- Utilities ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const flattenFileSystem = (nodes: FileSystemNode[]): FileSystemNode[] => {
  let flat: FileSystemNode[] = [];
  for (const node of nodes) {
    flat.push(node);
    if (node.children) {
      flat = flat.concat(flattenFileSystem(node.children));
    }
  }
  return flat;
};

// --- Context ---
const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persistence
  const [expandedFolderIds, setExpandedFolderIds] = useLocalStorage<string[]>('expanded-folders', ['root']);
  const [completedFileIds, setCompletedFileIds] = useLocalStorage<string[]>('completed-files', []);

  // Async Loading Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setFileSystem(mockFileSystem);
      setIsLoading(false);
      // Default to first file if none active
      if (!activeFileId) {
        // Find first file
        const firstFile = mockFileSystem[0]?.children?.[0]?.children?.[0]; // Rough find
        if (firstFile) setActiveFileId(firstFile.id);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleFolder = (id: string) => {
    const newSet = new Set(expandedFolderIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedFolderIds(Array.from(newSet));
  };

  const markAsComplete = (id: string) => {
    const newSet = new Set(completedFileIds);
    if (!newSet.has(id)) {
      newSet.add(id);
      // Trigger confetti or sound here if we had them
    }
    setCompletedFileIds(Array.from(newSet));
  };

  const getFileById = (id: string): FileSystemNode | null => {
    const find = (nodes: FileSystemNode[]): FileSystemNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = find(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(fileSystem);
  };

  // Calculate Progress
  const progress = useMemo(() => {
    if (fileSystem.length === 0) return 0;
    const allFiles = flattenFileSystem(fileSystem).filter(n => n.type === 'file');
    if (allFiles.length === 0) return 0;
    return Math.round((completedFileIds.length / allFiles.length) * 100);
  }, [fileSystem, completedFileIds]);

  return (
    <FileSystemContext.Provider value={{
      fileSystem,
      activeFileId,
      expandedFolderIds: new Set(expandedFolderIds),
      completedFileIds: new Set(completedFileIds),
      isLoading,
      setActiveFileId,
      toggleFolder,
      markAsComplete,
      getFileById,
      progress
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) throw new Error("useFileSystem must be used within FileSystemProvider");
  return context;
};

// --- Components ---

const ProgressBar = () => {
  const { progress } = useFileSystem();
  return (
    <div className="h-1 bg-slate-800 w-full fixed top-0 left-0 z-50">
      <div
        className="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const CodeSnippet: React.FC<{ code: string, language?: string }> = ({ code, language = 'javascript' }) => {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-950 group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
        </div>
        <span className="text-xs font-mono text-slate-500 uppercase">{language}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-slate-300">
          <code className="language-js">
            {code.split('\n').map((line, i) => (
              <div key={i} className="table-row">
                <span className="table-cell select-none text-right w-8 pr-4 text-slate-700 text-xs">{i + 1}</span>
                <span className="table-cell">
                  {line.split(/(\b(?:const|let|var|function|return|import|from|export|default|class|extends|if|else|for|while)\b|'.*?'|".*?"|`.*?`|\/\/.*)/g).map((token, j) => {
                    if (/^(const|let|var|function|return|import|from|export|default|class|extends|if|else|for|while)$/.test(token)) {
                      return <span key={j} className="text-indigo-400 font-semibold">{token}</span>; // Keywords
                    }
                    if (/^('.*?'|".*?"|`.*?`)$/.test(token)) {
                      return <span key={j} className="text-green-400">{token}</span>; // Strings
                    }
                    if (/^\/\/.*$/.test(token)) {
                      return <span key={j} className="text-slate-500 italic">{token}</span>; // Comments
                    }
                    return token;
                  })}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Simple Regex Parser
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBuffer = '';
  let codeLang = '';

  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End block
        elements.push(<CodeSnippet key={`code-${index}`} code={codeBuffer} language={codeLang} />);
        codeBuffer = '';
        inCodeBlock = false;
      } else {
        // Start block
        inCodeBlock = true;
        codeLang = line.trim().replace('```', '') || 'javascript';
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer += line + '\n';
      return;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={index} className="text-4xl font-bold text-white mb-6 mt-10 tracking-tight">{line.replace('# ', '')}</h1>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={index} className="text-2xl font-semibold text-slate-200 mb-4 mt-8 tracking-tight border-b border-slate-800 pb-2">{line.replace('## ', '')}</h2>);
      return;
    }

    // Lists
    if (line.trim().startsWith('- ')) {
      elements.push(<li key={index} className="ml-6 text-slate-300 mb-2 list-disc marker:text-indigo-500 pl-2">{line.replace('- ', '')}</li>);
      return;
    }

    // Bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = line.split(boldRegex);
    if (parts.length > 1) {
      elements.push(
        <p key={index} className="text-slate-300 leading-7 mb-4">
          {parts.map((part, i) => (
            i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
          ))}
        </p>
      );
      return;
    }

    if (line.trim() === '') return;

    elements.push(<p key={index} className="text-slate-300 leading-7 mb-4">{line}</p>);
  });

  return <div className="max-w-3xl mx-auto animate-fade-in pb-20">{elements}</div>;
};

const SidebarItem: React.FC<{ node: FileSystemNode; depth?: number }> = ({ node, depth = 0 }) => {
  const { activeFileId, setActiveFileId, expandedFolderIds, toggleFolder, completedFileIds } = useFileSystem();

  const isExpanded = expandedFolderIds.has(node.id);
  const isActive = activeFileId === node.id;
  const isCompleted = completedFileIds.has(node.id);

  return (
    <div className="select-none">
      <div
        className={`
                    flex items-center py-2 px-3 mx-2 rounded-md cursor-pointer transition-colors duration-150 group
                    ${isActive ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => node.type === 'folder' ? toggleFolder(node.id) : setActiveFileId(node.id)}
      >
        <span className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">
          {node.type === 'folder' ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            isCompleted ? <CheckCircle size={14} className="text-green-500" /> : <Circle size={14} />
          )}
        </span>

        <span className="mr-2 opacity-80">
          {node.type === 'folder' ? (
            isExpanded ? <FolderOpen size={16} className="text-indigo-400" /> : <Folder size={16} />
          ) : (
            <FileText size={16} />
          )}
        </span>

        <span className={`text-sm truncate ${isActive ? 'font-medium' : 'font-normal'}`}>{node.title}</span>
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div className="border-l border-slate-800 ml-6 pl-1 my-1">
          {node.children.map(child => (
            <SidebarItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { fileSystem, isLoading } = useFileSystem();
  const [isOpen, setIsOpen] = useState(true);

  // Mobile check
  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="w-72 border-r border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 w-full bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-md text-slate-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Terminal size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 tracking-tight">CodeDocs</h1>
            <p className="text-xs text-slate-500 font-mono">v1.0.0-beta</p>
          </div>
        </div>

        <div className="py-4 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          {fileSystem.map(node => (
            <SidebarItem key={node.id} node={node} />
          ))}
        </div>
      </div>
    </>
  );
};

const MainContent = () => {
  const { activeFileId, getFileById, isLoading, markAsComplete, completedFileIds } = useFileSystem();

  if (isLoading) return (
    <div className="flex-1 p-8 md:p-12 lg:p-16 max-w-4xl mx-auto w-full space-y-8">
      <div className="h-10 w-3/4 bg-slate-800 rounded animate-pulse" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-slate-800/50 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-800/50 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-slate-800/50 rounded animate-pulse" />
      </div>
    </div>
  );

  if (!activeFileId) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
      <div className="p-4 bg-slate-800/30 rounded-full mb-4">
        <FolderOpen size={48} className="text-slate-600" />
      </div>
      <p className="text-lg">Select a file to start learning</p>
    </div>
  );

  const activeNode = getFileById(activeFileId);
  if (!activeNode || activeNode.type !== 'file') return null;
  const isComplete = completedFileIds.has(activeFileId);

  return (
    <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto h-screen scroll-smooth">
      <div className="max-w-3xl mx-auto animate-slide-in">
        <div className="mb-4 flex items-center space-x-2 text-sm text-indigo-400 font-mono">
          <span>Docs</span>
          <ChevronRight size={12} />
          <span>{activeNode.title}</span>
        </div>

        <MarkdownRenderer content={activeNode.content || ''} />

        <div className="mt-16 pt-8 border-t border-slate-800 flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            Was this helpful? <span className="hover:text-indigo-400 cursor-pointer ml-2 transition-colors">Yes</span> <span className="hover:text-red-400 cursor-pointer ml-2 transition-colors">No</span>
          </p>
          <button
            onClick={() => markAsComplete(activeFileId)}
            disabled={isComplete}
            className={`
                            flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
                            ${isComplete
                ? 'bg-green-500/10 text-green-400 cursor-default border border-green-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95'
              }
                        `}
          >
            {isComplete ? (
              <>
                <CheckCircle size={18} />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Award size={18} />
                <span>Mark as Complete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <FileSystemProvider>
      <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
        <ProgressBar />
        <Sidebar />
        <div className="flex-1 md:pl-72 transition-all duration-300">
          <MainContent />
        </div>

        {/* Subtle Background Gradient */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>
      </div>
    </FileSystemProvider>
  );
};

export default App;
