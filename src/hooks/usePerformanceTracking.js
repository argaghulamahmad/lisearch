import { useState, useCallback } from 'react';
import { logger } from '../services/logger';

const MAX_PERFORMANCE_HISTORY = 20;

export const usePerformanceTracking = () => {
    const [performanceStats, setPerformanceStats] = useState({
        lastFetchDuration: 0,
        averageFetchDuration: 0,
        cacheHitRate: 0,
        totalQueries: 0,
    });
    const [performanceHistory, setPerformanceHistory] = useState([]);

    const updatePerformanceStats = useCallback((duration, fromCache) => {
        const timestamp = new Date().toLocaleTimeString();

        setPerformanceStats(prev => ({
            lastFetchDuration: duration,
            averageFetchDuration: prev.averageFetchDuration
                ? (prev.averageFetchDuration * prev.totalQueries + duration) / (prev.totalQueries + 1)
                : duration,
            totalQueries: prev.totalQueries + 1,
            cacheHitRate: fromCache
                ? ((prev.cacheHitRate * prev.totalQueries + 100) / (prev.totalQueries + 1))
                : ((prev.cacheHitRate * prev.totalQueries) / (prev.totalQueries + 1))
        }));

        setPerformanceHistory(prev => {
            const newHistory = [...prev, { timestamp, duration }];
            return newHistory.slice(-MAX_PERFORMANCE_HISTORY);
        });

        logger.info('Performance updated', {
            duration,
            fromCache,
            timestamp
        });
    }, []);

    return {
        performanceStats,
        performanceHistory,
        updatePerformanceStats
    };
};