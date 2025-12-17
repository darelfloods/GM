import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_URL = 'http://localhost:3333/api';

// Créer l'instance axios
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token
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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// ============================================
// AUTH API
// ============================================
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    logout: () =>
        api.post('/auth/logout'),

    me: () =>
        api.get('/auth/me'),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
    getStats: () =>
        api.get('/dashboard'),

    getChartStats: (periode: string = 'mois', annee?: number) =>
        api.get('/dashboard/stats', { params: { periode, annee } }),
};

// ============================================
// USERS API
// ============================================
export const usersApi = {
    getAll: (params?: Record<string, unknown>) =>
        api.get('/users', { params }),

    getById: (id: number) =>
        api.get(`/users/${id}`),

    create: (data: Record<string, unknown>) =>
        api.post('/users', data),

    update: (id: number, data: Record<string, unknown>) =>
        api.put(`/users/${id}`, data),

    delete: (id: number) =>
        api.delete(`/users/${id}`),

    toggleStatus: (id: number) =>
        api.post(`/users/${id}/toggle-status`),
};

// ============================================
// VILLES API
// ============================================
export const villesApi = {
    getAll: (params?: Record<string, unknown>) =>
        api.get('/villes', { params }),

    getById: (id: number) =>
        api.get(`/villes/${id}`),

    create: (data: Record<string, unknown>) =>
        api.post('/villes', data),

    update: (id: number, data: Record<string, unknown>) =>
        api.put(`/villes/${id}`, data),

    delete: (id: number) =>
        api.delete(`/villes/${id}`),
};

// ============================================
// ARRONDISSEMENTS API
// ============================================
export const arrondissementsApi = {
    getAll: (params?: Record<string, unknown>) =>
        api.get('/arrondissements', { params }),

    getById: (id: number) =>
        api.get(`/arrondissements/${id}`),

    create: (data: Record<string, unknown>) =>
        api.post('/arrondissements', data),

    update: (id: number, data: Record<string, unknown>) =>
        api.put(`/arrondissements/${id}`, data),

    delete: (id: number) =>
        api.delete(`/arrondissements/${id}`),
};

// ============================================
// MAIRIES API
// ============================================
export const mairiesApi = {
    getAll: (params?: Record<string, unknown>) =>
        api.get('/mairies', { params }),

    getById: (id: number) =>
        api.get(`/mairies/${id}`),

    create: (data: Record<string, unknown>) =>
        api.post('/mairies', data),

    update: (id: number, data: Record<string, unknown>) =>
        api.put(`/mairies/${id}`, data),

    delete: (id: number) =>
        api.delete(`/mairies/${id}`),

    getStats: (id: number) =>
        api.get(`/mairies/${id}/stats`),
};

// ============================================
// MARIAGES API
// ============================================
export const mariagesApi = {
    getAll: (params?: Record<string, unknown>) =>
        api.get('/mariages', { params }),

    getById: (id: number) =>
        api.get(`/mariages/${id}`),

    create: (data: Record<string, unknown>) =>
        api.post('/mariages', data),

    update: (id: number, data: Record<string, unknown>) =>
        api.put(`/mariages/${id}`, data),

    delete: (id: number) =>
        api.delete(`/mariages/${id}`),

    validate: (id: number) =>
        api.post(`/mariages/${id}/validate`),
};

// ============================================
// ACTES API
// ============================================
export const actesApi = {
    getAll: (params?: Record<string, unknown>) =>
        api.get('/actes', { params }),

    getById: (id: number) =>
        api.get(`/actes/${id}`),

    generate: (mariageId: number) =>
        api.post('/actes/generate', { mariageId }),

    validate: (id: number) =>
        api.post(`/actes/${id}/validate`),

    markPrinted: (id: number) =>
        api.post(`/actes/${id}/print`),

    cancel: (id: number) =>
        api.post(`/actes/${id}/cancel`),
};
