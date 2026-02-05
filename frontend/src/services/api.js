import axios from 'axios';

const API_BASE_URL = 'https://socialapp-xt0x.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Posts API calls
export const postsAPI = {
  getPosts: (page = 1, limit = 5) => api.get(`/posts?page=${page}&limit=${limit}`),
  createPost: (postData) => api.post('/posts', postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  likePost: (postId) => api.put(`/posts/${postId}/like`),
  commentPost: (postId, comment) => api.put(`/posts/${postId}/comment`, { text: comment }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

export default api;
