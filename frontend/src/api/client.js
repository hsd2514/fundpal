import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storage = localStorage.getItem('fundpal-storage');
  if (storage) {
    const { state } = JSON.parse(storage);
    if (state?.user?.id) {
      config.headers['user-id'] = state.user.id;
    }
  }
  return config;
});

export default api;
