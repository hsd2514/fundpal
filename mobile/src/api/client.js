import axios from 'axios';

// Replace with your machine's IP address found via ipconfig
const API_URL = 'http://172.20.10.5:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  } // 10 seconds timeout
});

// Add logging interceptors
api.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, error => {
  console.log('Response Error:', JSON.stringify(error, null, 2));
  return Promise.reject(error);
});

export default api;
