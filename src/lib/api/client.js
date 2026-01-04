const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Client API avec gestion automatique des tokens et erreurs
 */
class ApiClient {
    constructor() {
        this.baseURL = API_URL;
    }

    /**
     * Récupérer le token du localStorage
     */
    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    /**
     * Sauvegarder le token
     */
    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    /**
     * Supprimer le token
     */
    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    /**
     * Récupérer les headers par défaut
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...customHeaders,
        };

        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Gérer les réponses
     */
    async handleResponse(response) {
        // Si pas de contenu (204 No Content)
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        // Si erreur
        if (!response.ok) {
            // Token expiré ou invalide
            if (response.status === 401) {
                this.removeToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }

            throw {
                status: response.status,
                message: data.message || 'Une erreur est survenue',
                errors: data.errors || null,
            };
        }

        return data;
    }

    /**
     * GET Request
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);

        // Ajouter les query params
        Object.keys(params).forEach((key) => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * POST Request
     */
    async post(endpoint, body = {}, isFormData = false) {
        const headers = isFormData
            ? this.getHeaders({ 'Content-Type': 'multipart/form-data' })
            : this.getHeaders();

        // Supprimer Content-Type si FormData (le navigateur le gère)
        if (isFormData) {
            delete headers['Content-Type'];
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body),
        });

        return this.handleResponse(response);
    }

    /**
     * PUT Request
     */
    async put(endpoint, body = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse(response);
    }

    /**
     * PATCH Request
     */
    async patch(endpoint, body = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse(response);
    }

    /**
     * DELETE Request
     */
    async delete(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * Download File
     */
    async download(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erreur lors du téléchargement');
        }

        return response.blob();
    }
}

// Instance unique du client
const apiClient = new ApiClient();

export default apiClient;