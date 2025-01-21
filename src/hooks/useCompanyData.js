import { useState, useCallback } from 'react';
import { notification } from 'antd';
import db from '../db';
import { logger } from '../services/logger';

const PAGE_SIZE = 100;

export const useCompanyData = (updatePerformanceStats) => {
    const [companiesData, setCompaniesData] = useState({ items: [], total: 0, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortField, setSortField] = useState('company');
    const [sortOrder, setSortOrder] = useState('ascend');

    const fetchCompanies = useCallback(async (page, searchTerm, options = {}) => {
        const fetchId = Date.now();
        logger.startTimer(`fetch_${fetchId}`);

        try {
            setLoading(true);
            setError(null);

            const result = await db.getCompaniesPaginated(page, PAGE_SIZE, searchTerm, {
                ...options,
                sortBy: sortField,
                sortOrder
            });

            setCompaniesData(result);

            const duration = logger.endTimer(`fetch_${fetchId}`);
            updatePerformanceStats(duration, result.fromCache);

            logger.info('Companies fetched', {
                page,
                searchTerm,
                count: result.items.length,
                total: result.total,
                duration,
                fromCache: result.fromCache
            });
        } catch (err) {
            const errorMessage = err.message;
            setError(errorMessage);
            logger.error('Error fetching companies', {
                error: errorMessage,
                page,
                searchTerm
            });
            notification.error({
                message: 'Error loading companies',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [sortField, sortOrder, updatePerformanceStats]);

    const handleTableChange = useCallback((pagination, filters, sorter, searchTerm) => {
        if (sorter.field) {
            setSortField(sorter.field);
            setSortOrder(sorter.order);
        }

        logger.trackEvent('navigation', 'changePage', 'companiesTable', pagination.current);
        fetchCompanies(pagination.current, searchTerm);
    }, [fetchCompanies]);

    return {
        companiesData,
        loading,
        error,
        sortField,
        sortOrder,
        fetchCompanies,
        handleTableChange
    };
};