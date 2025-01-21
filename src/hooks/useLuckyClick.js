import { useCallback } from 'react';
import { notification } from 'antd';
import { logger } from '../services/logger';

export const useLuckyClick = () => {
    const handleLuckyClick = useCallback((type, items, visitedKey) => {
        try {
            logger.startTimer('luckyClick');
            const visitedSet = new Set(JSON.parse(localStorage.getItem(visitedKey)) || []);
            const unvisitedItems = items.filter(({ id }) => !visitedSet.has(id));

            if (unvisitedItems.length === 0) {
                logger.info('No more unvisited items', { type });
                notification.info({
                    message: 'No more items',
                    description: 'You have visited all items in this list!',
                });
                return;
            }

            const selectedItems = new Set();
            for (let i = 0; i < Math.min(5, unvisitedItems.length); i++) {
                let item;
                do {
                    const randomIndex = Math.floor(Math.random() * unvisitedItems.length);
                    item = unvisitedItems[randomIndex];
                } while (selectedItems.has(item.id));

                selectedItems.add(item.id);
                visitedSet.add(item.id);

                logger.trackEvent('interaction', 'luckyClick', item.company);
                notification.success({
                    message: `Opening ${type}`,
                    description: `Opening ${item.company} in new tab!`,
                });
                window.open(`https://www.google.com/search?q=${item.company}`, '_blank');
            }

            localStorage.setItem(visitedKey, JSON.stringify([...visitedSet]));
        } catch (err) {
            logger.error('Error in lucky click', { error: err.message });
            notification.error({
                message: 'Error processing lucky click',
                description: err.message,
            });
        } finally {
            logger.endTimer('luckyClick');
        }
    }, []);

    return handleLuckyClick;
};