"use client";

import { useEffect, useState } from "react";

/**
 * Hook personalizado para implementar debounce em valores.
 *
 * @param value - O valor a ser debounced
 * @param delay - O delay em milissegundos para o debounce
 * @returns O valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
