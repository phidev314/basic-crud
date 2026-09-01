import { useState, useEffect } from "react";

/**
 * @description - custom hook untuk menunda pembaruan nilai/state sampai pengguna selesai mengetik
 * @param {any} value - nilai input yang akan didebounce
 * @param {number} delay - durasi jeda penundaan dalam milidetik (default: 400ms)
 * @returns {any} - nilai yang telah didebounce
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // set timer tunda pembaruan nilai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // bersihkan timer jika nilai berubah sebelum interval delay selesai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
