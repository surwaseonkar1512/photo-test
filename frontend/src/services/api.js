import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    // baseURL: 'http://localhost:5000/api',
    baseURL: 'https://photo-test-icw4.onrender.com/api',


    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo.token) {
            config.headers.Authorization = `Bearer ${parsedInfo.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor for handling global errors
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;

    // Optionally toast the error for specific codes, like unauthorized
    if (error.response && error.response.status === 401) {
        // Handle logout or redirect if needed
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('userInfo');
        window.location.href = '/admin/login';
    }

    return Promise.reject(error);
});

export default api;
