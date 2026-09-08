import { useEffect, useRef, useState } from "react";

export interface DebouncedSearchOptions {
  delayMs: number;
  minLength: number;
}

export default function useDebouncedSearch<T>(
  term: string,
  search: (term: string) => Promise<T>,
  { delayMs, minLength }: DebouncedSearchOptions,
): { results: T | undefined; loading: boolean } {
  const [results, setResults] = useState<T>();
  const [loading, setLoading] = useState(false);
  const latestSearch = useRef(search);

  useEffect(() => {
    latestSearch.current = search;
  });

  useEffect(() => {
    setResults(undefined);

    if (term.length < minLength) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let outdated = false;

    const timer = setTimeout(async () => {
      try {
        const found = await latestSearch.current(term);
        if (!outdated) {
          setResults(found);
        }
      } catch {
        if (!outdated) {
          setResults(undefined);
        }
      } finally {
        if (!outdated) {
          setLoading(false);
        }
      }
    }, delayMs);

    return () => {
      outdated = true;
      clearTimeout(timer);
    };
  }, [term, delayMs, minLength]);

  return { results, loading };
}
