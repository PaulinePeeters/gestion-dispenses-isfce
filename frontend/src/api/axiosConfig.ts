import axios from 'axios';
import keycloak from '../auth/keycloak';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api';
let refreshPromise: Promise<boolean> | null = null; // Gestion des tentatives de rafraîchissement du token

const api = axios.create({ baseURL: BASE_URL });

// Interception des requêtes pour ajouter le token
api.interceptors.request.use(
    (config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interception des réponses pour gérer les erreurs d'authentification
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config?._retry) {
            error.config._retry = true;
            try {
                if (!refreshPromise) {
                    refreshPromise = keycloak.updateToken(30).finally(() => {
                        refreshPromise = null;
                    });
                }
                await refreshPromise;
                error.config.headers.Authorization = `Bearer ${keycloak.token}`;
                return api.request(error.config);
            } catch {
                console.warn('Token refresh échoué, redirection vers le login.');
                keycloak.login();
            }
        }
        return Promise.reject(error);
    }
);

export default api;