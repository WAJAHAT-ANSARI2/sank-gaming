import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost/backend/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Auth ----
export const signup        = (data) => API.post('/auth/signup.php', data);
export const login         = (data) => API.post('/auth/login.php', data);
export const getMe         = ()     => API.get('/auth/me.php');

// ---- CDs ----
export const getCDs        = (params) => API.get('/cds/index.php', { params });
export const getCDDetail   = (id)     => API.get('/cds/detail.php', { params: { id } });
export const createCD      = (data)   => API.post('/cds/index.php', data);
export const updateCD      = (id, data) => API.put('/cds/detail.php', data, { params: { id } });
export const deleteCD      = (id)     => API.delete('/cds/detail.php', { params: { id } });

// ---- Rentals ----
export const getMyRentals      = ()           => API.get('/rentals/index.php');
export const bookRental        = (data)       => API.post('/rentals/index.php', data);
export const cancelRental      = (id)         => API.delete('/rentals/manage.php', { params: { id } });
export const updateRentalStatus  = (id, status)         => API.put('/rentals/manage.php', { status }, { params: { id } });
export const updatePaymentStatus = (id, payment_status) => API.put('/rentals/manage.php', { payment_status }, { params: { id } });

// ---- Admin ----
export const getAdminStats    = ()       => API.get('/admin/dashboard.php', { params: { type: 'stats' } });
export const getAdminRentals  = (status) => API.get('/admin/dashboard.php', { params: { type: 'rentals', status } });
export const getCalendarEvents= (month)  => API.get('/admin/dashboard.php', { params: { type: 'calendar', month } });

// ---- Settings ----
export const getSettings    = ()     => API.get('/admin/settings.php');
export const updateSettings = (data) => API.put('/admin/settings.php', data);

// ---- Contact ----
export const sendContactMessage = (data) => API.post('/contact.php', data);

export default API;
