import { useEffect, useState } from 'react';

/**
 * Hook to hide the mouse cursor after a period of inactivity.
 * @param isActive - Whether the auto-hide behavior should be active (e.g., only when timer is running)
 * @param timeout - Duration in ms before hiding (default 3000ms)
 */
export function useCursorAutoHide(isActive: boolean, timeout: number = 3000) {
    useEffect(() => {
        if (!isActive) {
            document.body.style.cursor = '';
            return;
        }

        let timer: NodeJS.Timeout;

        const handleMouseMove = () => {
            document.body.style.cursor = '';
            clearTimeout(timer);
            timer = setTimeout(() => {
                document.body.style.cursor = 'none';
            }, timeout);
        };

        // Initial check
        handleMouseMove();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseMove);
        window.addEventListener('keydown', handleMouseMove);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseMove);
            window.removeEventListener('keydown', handleMouseMove);
            document.body.style.cursor = '';
        };
    }, [isActive, timeout]);
}
