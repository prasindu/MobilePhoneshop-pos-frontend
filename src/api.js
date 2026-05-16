// src/services/api.js
import axios from 'axios';

const API_URL = 'https://prasindu-pos-api-v2-bwb4arb8bkhzc8hn.southeastasia-01.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
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

export default {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),

  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  createProduct: (product) => api.post('/products', product),
  updateProduct: (id, product) => api.put(`/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (productId, quantity, increase) => 
    api.put(`/products/${productId}/stock`, null, { 
      params: { quantity, increase } 
    }),

  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (category) => api.post('/categories', category),
  updateCategory: (id, category) => api.put(`/categories/${id}`, category),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Sales
  getSales: (params) => api.get('/sales', { params }),
  getSaleById: (id) => api.get(`/sales/${id}`),
  getSaleByInvoice: (invoiceId) => api.get(`/sales/invoice/${invoiceId}`),
  createSale: (saleData) => api.post('/sales', saleData), // Removed the duplicate!
  processReturn: (returnData) => api.post('/sales/return', returnData),
  getTodaySales: () => api.get('/sales/today'),

  // Analytics
  getAnalytics: (params) => api.get('/analytics', { params }),
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};