// Script to update blog articles with comprehensive content
// Run this with: node update-blogs.js

import mongoose from 'mongoose';
import Blog from './models/Blog.js';
import dotenv from 'dotenv';

dotenv.config();

const comprehensiveBlogs = [
  {
    slug: 'react-hooks-guide',
    title: 'React Hooks Deep Dive: Complete Guide',
    category: 'React',
    excerpt: 'Master useState, useEffect, useContext, useMemo, useCallback, and custom hooks with real-world examples and best practices',
    skills: ['React', 'JavaScript'],
    readMin: 15,
    content: `# React Hooks: A Complete Guide

React Hooks revolutionized how we write components by allowing us to use state and lifecycle features in functional components. This comprehensive guide covers all essential hooks and advanced patterns.

## Table of Contents
1. Introduction to Hooks
2. Basic Hooks (useState, useEffect, useContext)
3. Additional Hooks (useReducer, useCallback, useMemo, useRef)
4. Custom Hooks
5. Rules of Hooks
6. Best Practices
7. Common Patterns

## 1. Introduction to Hooks

Hooks are functions that let you "hook into" React state and lifecycle features from function components. Introduced in React 16.8, they've become the standard way to write React applications.

### Why Use Hooks?

**Benefits:**
- Simpler, more readable code
- Better code reuse through custom hooks
- Easier to test (pure functions)
- No 'this' keyword confusion
- Better performance optimization tools

## 2. Basic Hooks

### useState - Managing Component State

The most fundamental hook for adding state to functional components.

**Syntax:**
\`\`\`javascript
const [state, setState] = useState(initialValue);
\`\`\`

**Example: Counter Component**
\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
\`\`\`

**Best Practices:**
- Use multiple useState calls for unrelated state values
- Don't store derived data in state
- Use functional updates when new state depends on previous state:
  \`\`\`javascript
  setCount(prevCount => prevCount + 1);
  \`\`\`

**Complex State Example:**
\`\`\`javascript
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });
  
  const updateField = (field, value) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <form>
      <input 
        value={user.name} 
        onChange={e => updateField('name', e.target.value)} 
      />
      <input 
        value={user.email} 
        onChange={e => updateField('email', e.target.value)} 
      />
    </form>
  );
}
\`\`\`

### useEffect - Handling Side Effects

useEffect lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.

**Syntax:**
\`\`\`javascript
useEffect(() => {
  // Effect code
  
  return () => {
    // Cleanup (optional)
  };
}, [dependencies]);
\`\`\`

**Example: Document Title**
\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

**Example: Data Fetching**
\`\`\`javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{user.name}</div>;
}
\`\`\`

**Dependency Array Rules:**
- Empty array \`[]\`: Run once after initial render (componentDidMount)
- No array: Run after every render
- \`[dep1, dep2]\`: Run when dependencies change

**Example: Event Listeners**
\`\`\`javascript
useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []); // Empty deps = setup once, cleanup on unmount
\`\`\`

### useContext - Consuming Context

Access context values without prop drilling.

**Setup:**
\`\`\`javascript
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

**Usage:**
\`\`\`javascript
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button 
      className={theme}
      onClick={toggleTheme}
    >
      Current theme: {theme}
    </button>
  );
}
\`\`\`

## 3. Additional Hooks

### useMemo - Memoize Expensive Calculations

Optimize performance by caching computed values.

\`\`\`javascript
const expensiveValue = useMemo(() => {
  return items.reduce((total, item) => {
    return total + complexCalculation(item);
  }, 0);
}, [items]);
\`\`\`

**When to use useMemo:**
- Expensive calculations
- Preventing unnecessary re-renders
- Referential equality for dependencies

### useCallback - Memoize Functions

Prevent unnecessary re-renders of child components by memoizing callback functions.

\`\`\`javascript
const memoizedCallback = useCallback(
  (id) => {
    doSomething(id, dependency);
  },
  [dependency]
);
\`\`\`

**Example:**
\`\`\`javascript
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  
  // Without useCallback, this function is recreated on every render
  const handleItemClick = useCallback((itemId) => {
    console.log('Item clicked:', itemId);
  }, []); // No dependencies = stable reference
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <ItemList items={items} onItemClick={handleItemClick} />
    </div>
  );
}

const ItemList = React.memo(({ items, onItemClick }) => {
  console.log('ItemList rendered');
  return items.map(item => (
    <Item key={item.id} onClick={() => onItemClick(item.id)} />
  ));
});
\`\`\`

### useReducer - Complex State Logic

Alternative to useState for complex state logic.

\`\`\`javascript
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <h2>Count: {state.count}</h2>
      <input 
        type="number"
        value={state.step}
        onChange={e => dispatch({ 
          type: 'setStep', 
          payload: Number(e.target.value) 
        })}
      />
      <button onClick={() => dispatch({ type: 'increment' })}>
        +{state.step}
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        -{state.step}
      </button>
      <button onClick={() => dispatch({ type: 'reset' })}>
        Reset
      </button>
    </div>
  );
}
\`\`\`

### useRef - Persist Values & Access DOM

Keep mutable values that persist across renders without causing re-renders.

**DOM Access:**
\`\`\`javascript
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
\`\`\`

**Persist Values:**
\`\`\`javascript
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, []);
  
  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };
  
  return (
    <div>
      <h2>{count}</h2>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
\`\`\`

## 4. Custom Hooks

Extract reusable stateful logic into custom hooks.

**Example: useFetch**
\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => { cancelled = true; };
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

**Example: useLocalStorage**
\`\`\`javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, setStoredValue];
}

// Usage
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}
\`\`\`

## 5. Rules of Hooks

**Two Main Rules:**

1. **Only call hooks at the top level**
   - Don't call inside loops, conditions, or nested functions
   - Ensures hooks are called in the same order each render

2. **Only call hooks from React functions**
   - Call from React function components
   - Call from custom hooks
   - Don't call from regular JavaScript functions

**ESLint Plugin:**
Install eslint-plugin-react-hooks to enforce these rules automatically.

## 6. Best Practices

1. **Split state logically**: Use multiple useState calls rather than one giant object
2. **Extract custom hooks**: Reuse stateful logic across components
3. **Optimize with useMemo/useCallback**: But don't over-optimize
4. **Use TypeScript**: Get better type inference and autocomplete
5. **Name custom hooks with 'use' prefix**: Following convention
6. **Keep effects focused**: One effect per concern
7. **Always clean up effects**: Return cleanup functions when needed
8. **Use functional updates**: When new state depends on previous state

## 7. Common Patterns

### Debounced Search
\`\`\`javascript
function SearchInput() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  useEffect(() => {
    if (debouncedQuery) {
      // Perform search
      fetch(\`/api/search?q=\${debouncedQuery}\`);
    }
  }, [debouncedQuery]);
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
\`\`\`

### Form Handling
\`\`\`javascript
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    } else {
      setErrors(validationErrors);
    }
  };
  
  return { values, errors, handleChange, handleSubmit };
}
\`\`\`

## Conclusion

React Hooks provide a powerful, flexible way to build components. They make code more reusable, testable, and easier to understand. Master these patterns and you'll write cleaner, more maintainable React code.

## References & Further Reading

- **Official React Documentation**: https://react.dev/reference/react
- **React Hooks API Reference**: https://react.dev/reference/react/hooks
- **Rules of Hooks**: https://react.dev/warnings/invalid-hook-call-warning
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **React Hook Form**: https://react-hook-form.com/
- **SWR for Data Fetching**: https://swr.vercel.app/
- **React Query**: https://tanstack.com/query/latest

**Community Resources:**
- Kent C. Dodds' Epic React course
- Dan Abramov's blog posts on Overreacted.io
- React DevTools for debugging hooks
- awesome-react-hooks GitHub repository

Start with the basic hooks, then gradually adopt patterns that make sense for your application. Happy coding!`
  }
];

async function updateBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    for (const blog of comprehensiveBlogs) {
      await Blog.findOneAndUpdate(
        { slug: blog.slug },
        blog,
        { upsert: true, new: true }
      );
      console.log(\`Updated: \${blog.title}\`);
    }
    
    console.log('All blogs updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating blogs:', error);
    process.exit(1);
  }
}

updateBlogs();
