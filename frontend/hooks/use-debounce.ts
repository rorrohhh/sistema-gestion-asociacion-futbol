import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores - útil para búsquedas en tiempo real
 * @param value Valor a hacer debounce
 * @param delay Delay en milisegundos (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
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
