import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// A request interceptor to include the JWT token in all requests
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// A request interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // For example, redirect to login or refresh token
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;