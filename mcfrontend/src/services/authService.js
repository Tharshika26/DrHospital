import axiosInstance from '../utils/axioInstance';

const login = async (email, password) => {
    console.log('authService.login called with:', email);
    try {
        const response = await axiosInstance.post('/auth/login', { email, password });
        console.log('authService.login response:', response.data);
        if (response.data) {
            sessionStorage.setItem('userInfo', JSON.stringify(response.data));
            console.log('authService.login stored userInfo in sessionStorage');
        }
        return response.data;
    } catch (error) {
        console.error('authService.login error:', error);
        throw error;
    }
};

const register = async (userData) => {
    console.log('authService.register called with:', userData);
    try {
        const response = await axiosInstance.post('/auth/register', userData);
        console.log('authService.register response:', response.data);
        if (response.data) {
            sessionStorage.setItem('userInfo', JSON.stringify(response.data));
            console.log('authService.register stored userInfo in sessionStorage');
        }
        return response.data;
    } catch (error) {
        console.error('authService.register error:', error);
        throw error;
    }
};

const logout = async () => {
    console.log('authService.logout called');
    sessionStorage.removeItem('userInfo');
    try {
        await axiosInstance.post('/auth/logout');
    } catch (error) {
        console.error('Logout API error:', error);
    }
};

const getCurrentUser = () => {
    const user = sessionStorage.getItem('userInfo');
    return user ? JSON.parse(user) : null;
};

const sendEmailOtp = async (email, name) => {
    const response = await axiosInstance.post('/auth/send-email-otp', { email, name });
    return response.data;
};

const verifyEmailOtp = async (email, code) => {
    const response = await axiosInstance.post('/auth/verify-email-otp', { email, code });
    return response.data;
};

const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    sendEmailOtp,
    verifyEmailOtp,
};

export default authService;
