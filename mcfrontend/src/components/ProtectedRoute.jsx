import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userInfoString = localStorage.getItem('userInfo');

    if (!userInfoString) {
        return <Navigate to="/login" replace />;
    }

    try {
        const userInfo = JSON.parse(userInfoString);
        if (!userInfo.token) {
            return <Navigate to="/login" replace />;
        }

        // Decode the JWT (base64url)
        const base64Url = userInfo.token.split('.')[1];
        if (!base64Url) {
            throw new Error("Invalid token format");
        }
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Decode URI component handles special characters
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
            localStorage.removeItem('userInfo');
            return <Navigate to="/login" replace />;
        }

        // User role validation
        const userRole = userInfo.role || payload.role;

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            // Redirect them to their own dashboard
            if (userRole) {
                return <Navigate to={`/${userRole}/dashboard`} replace />;
            }
            return <Navigate to="/login" replace />;
        }

        return children;
    } catch (e) {
        console.error("Token verification failed in route protection:", e);
        localStorage.removeItem('userInfo');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
