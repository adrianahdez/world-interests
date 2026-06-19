import { useState, useEffect } from 'react';

// Returns a Date object that updates every second.
// Centralises the tick interval so components only render time output,
// not manage timers independently.
export default function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
