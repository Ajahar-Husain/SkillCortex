// Comprehensive blog articles with detailed content
export const blogArticles = [
  {
    slug: 'react-hooks-guide',
    title: 'React Hooks Deep Dive: Master Modern React',
    category: 'React',
    excerpt: 'Comprehensive guide to React Hooks including useState, useEffect, useContext, useMemo, useCallback, and custom hooks with real-world examples and best practices.',
    skills: ['React', 'JavaScript'],
    readMin: 15,
    content: `# React Hooks: A Complete Guide

React Hooks revolutionized how we write components by allowing us to use state and lifecycle features in functional components. This guide covers all the essential hooks and advanced patterns.

## What Are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 and have become the standard way to write React components.

## Why Use Hooks?

1. **Simpler Code**: No need for class components
2. **Better Code Reuse**: Extract stateful logic into reusable functions
3. **Easier Testing**: Pure functions are easier to test
4. **Better Performance**: Optimize with useMemo and useCallback

## Essential Hooks

### useState - Managing State

The most basic hook for adding state to functional components:

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

**Best Practices:**
- Use multiple useState calls for unrelated state
- Don't store derived values in state
- Use functional updates when new state depends on previous state

### useEffect - Side Effects

Handle side effects like data fetching, subscriptions, and DOM mutations:

\`\`\`javascript
useEffect(() => {
  // Effect code here
  document.title = \`Count: \${count}\`;
  
  // Cleanup function (optional)
  return () => {
    document.title = 'React App';
  };
}, [count]); // Dependencies array
\`\`\`

**Dependency Array Rules:**
- Empty array []: Run once on mount
- No array: Run after every render
- [dep1, dep2]: Run when dependencies change

### useContext - Consuming Context

Access context values without prop drilling:

\`\`\`javascript
const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
\`\`\`

### useMemo - Memoize Expensive Calculations

Optimize performance by caching computed values:

\`\`\`javascript
const expensiveValue = useMemo(() => {
  return heavyComputation(input);
}, [input]);
\`\`\`

### useCallback - Memoize Functions

Prevent unnecessary re-renders of child components:

\`\`\`javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
\`\`\`

## Advanced Hooks

### useReducer - Complex State Logic

Better than useState for complex state:

\`\`\`javascript
const [state, dispatch] = useReducer(reducer, initialState);

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
\`\`\`

### useRef - Persist Values & DOM Access

Keep mutable values that don't cause re-renders:

\`\`\`javascript
const inputRef = useRef(null);

const focusInput = () => {
  inputRef.current.focus();
};

return <input ref={inputRef} />;
\`\`\`

## Custom Hooks

Create reusable stateful logic:

\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
\`\`\`

## Hook Rules

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Follow the naming convention: use[Name]

## Performance Tips

1. Use React.memo for components
2. Split state for better granularity
3. Use useCallback for event handlers
4. Lazy initialize expensive state
5. Use code splitting with React.lazy

## Common Patterns

### Data Fetching Pattern
\`\`\`javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setUser(data);
      });
      
    return () => { cancelled = true; };
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

### Form Handling Pattern
\`\`\`javascript
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  return [values, handleChange];
}
\`\`\`

## Testing Hooks

Use @testing-library/react-hooks:

\`\`\`javascript
import { renderHook, act } from '@testing-library/react-hooks';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
\`\`\`

## Conclusion

React Hooks provide a powerful, flexible way to build components. Master these patterns and you'll write cleaner, more maintainable React code.

## References

- Official React Hooks Documentation: https://react.dev/reference/react
- React Hooks API Reference: https://react.dev/reference/react/hooks
- Rules of Hooks: https://react.dev/warnings/invalid-hook-call-warning
- Testing Library: https://testing-library.com/docs/react-testing-library/intro/

**Learn More:**
- React DevTools for debugging hooks
- React Hook Form for advanced form handling
- SWR and React Query for data fetching
- Zustand and Jotai for lightweight state management`
  }
];
