import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Auto-restore token
const savedToken = localStorage.getItem('token');
if (savedToken) {
    setToken(savedToken);
}

export default api;
