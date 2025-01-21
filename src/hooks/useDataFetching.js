import { useState, useEffect, useCallback } from 'react';
import { notification } from 'antd';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDataFetching = (fetchFn, key) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getCachedData = useCallback(() => {
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
            const { data: cachedData, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return cachedData;
            }
        }
        return null;
    }, [key]);

    const setCachedData = useCallback((newData) => {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
            data: newData,
            timestamp: Date.now()
        }));
    }, [key]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Try to get cached data first
            const cachedData = getCachedData();
            if (cachedData) {
                setData(cachedData);
                setLoading(false);
                return;
            }

            // If no cache, fetch fresh data
            const result = await fetchFn();
            setData(result);
            setCachedData(result);

        } catch (err) {
            setError(err);
            notification.error({
                message: 'Error fetching data',
                description: err.message,
                duration: 3
            });
        } finally {
            setLoading(false);
        }
    }, [fetchFn, getCachedData, setCachedData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = useCallback(() => {
        localStorage.removeItem(`cache_${key}`);
        fetchData();
    }, [fetchData, key]);

    return {
        data,
        loading,
        error,
        refresh
    };
};

export const useDebounce = (value, delay = 300) => {
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