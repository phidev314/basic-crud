import { useState, useEffect } from "react";

/**
 * Custom hook useDebounce untuk menunda eksekusi/update state
 *
 * @template T
 * @param {T} value - Nilai yang akan di-debounce
 * @param {number} delay - Waktu tunda dalam milidetik (default: 400ms)
 * @returns {T} - Nilai setelah ter-debounce
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
