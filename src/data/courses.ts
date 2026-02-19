import type { FileNode } from '@/types';

// ─────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────

export const STORAGE_KEYS = {
  COMPLETED: 'devtutorials-completed',
  COURSES: 'devtutorials-courses',
  BUNDLES: 'devtutorials-bundles',
  ACTIVE_BUNDLE: 'devtutorials-active-bundle',
} as const;

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

export const flattenFileSystem = (nodes: FileNode[]): FileNode[] => {
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

// ─────────────────────────────────────────────
// DEFAULT COURSE DATA
// ─────────────────────────────────────────────

export const defaultCourses: FileNode[] = [
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
