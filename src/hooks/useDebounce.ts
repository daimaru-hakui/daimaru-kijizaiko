import { useState, useEffect } from "react";

/** 一覧の絞り込み入力に使う既定のデバウンス時間 */
export const SEARCH_DEBOUNCE_MS = 300;

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
