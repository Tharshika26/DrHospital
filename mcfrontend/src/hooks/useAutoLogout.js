import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const useAutoLogout = (timeoutMs = 30 * 60 * 1000) => {
    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef(null);

    const logoutUser = useCallback(async () => {
        const userInfo = authService.getCurrentUser();
        if (userInfo) {
            try {
                await authService.logout();
                toast.error("You have been logged out due to inactivity");
                navigate('/login');
            } catch (error) {
                console.error("Auto logout failed:", error);
            }
        }
    }, [navigate]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Only start timer if user is logged in
        if (authService.getCurrentUser()) {
            timerRef.current = setTimeout(() => {
                logoutUser();
            }, timeoutMs);
        }
    }, [logoutUser, timeoutMs]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        
        const handleActivity = () => {
            resetTimer();
        };

        // Initial setup
        resetTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [resetTimer, location.pathname]); // Re-evaluate on route change
};

export default useAutoLogout;
