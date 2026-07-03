import axiosInstance from '../utils/axioInstance';

const login = async (email, password) => {
    console.log('authService.login called with:', email);
    try {
        const response = await axiosInstance.post('/auth/login', { email, password });
        console.log('authService.login response:', response.data);
        if (response.data) {
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            console.log('authService.login stored userInfo in localStorage');
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
            console.log('authService.register successful, user must now log in manually');
        }
        return response.data;
    } catch (error) {
        console.error('authService.register error:', error);
        throw error;
    }
};

const logout = async () => {
    console.log('authService.logout called');
    localStorage.removeItem('userInfo');
    try {
        await axiosInstance.post('/auth/logout');
    } catch (error) {
        console.error('Logout API error:', error);
    }
};

const getCurrentUser = () => {
    const user = localStorage.getItem('userInfo');
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

const fetchProfile = async () => {
    try {
        const response = await axiosInstance.get('/users/profile');
        if (response.data) {
            // Merge with existing token in local storage
            const userInfoStr = localStorage.getItem('userInfo');
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
            const updatedInfo = { ...response.data, token: userInfo.token };
            
            const updatedInfoStr = JSON.stringify(updatedInfo);
            // Prevent infinite cross-tab reload loops by only setting if changed
            if (userInfoStr !== updatedInfoStr) {
                localStorage.setItem('userInfo', updatedInfoStr);
            }
            return updatedInfo;
        }
    } catch (error) {
        console.error('Failed to fetch profile', error);
        // If 401 or 403, axioInstance already handles logout
    }
    return null;
};

const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    sendEmailOtp,
    verifyEmailOtp,
    fetchProfile,
};

export default authService;
