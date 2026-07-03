import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
if (apiURL && !apiURL.endsWith('/api')) {
    apiURL = apiURL.replace(/\/$/, '') + '/api';
}

const axiosInstance = axios.create({
    baseURL: apiURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized! Potential token expiry. Redirecting to login...');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        } else if (error.response && error.response.status === 403) {
            console.warn('Forbidden! Redirecting to correct dashboard...');
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo && userInfo.role) {
                window.location.href = `/${userInfo.role}/dashboard`;
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
