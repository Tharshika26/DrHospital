import axiosInstance from '../utils/axioInstance';

const uploadReport = async (formData) => {
    try {
        const response = await axiosInstance.post('/reports/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getMyReports = async () => {
    try {
        const response = await axiosInstance.get('/reports');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getReportDetails = async (id) => {
    try {
        const response = await axiosInstance.get(`/reports/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const reportService = {
    uploadReport,
    getMyReports,
    getReportDetails,
};

export default reportService;
