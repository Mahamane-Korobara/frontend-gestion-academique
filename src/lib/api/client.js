'use client';

/**
 * Client API centralisé avec fetch
 * Version optimisée pour la gestion des JSON et des FormData (Upload)
 */

// Importation des constantes (adapte les chemins selon ton projet)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
    constructor() {
        this.baseURL = API_URL;
    }

    /**
     * Récupérer le token depuis localStorage (Client-side uniquement)
     */
    getToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token'); // ou STORAGE_KEYS.TOKEN si tu as un fichier de constantes
    }

    /**
     * Gestion des headers
     * Si isFormData est true, on laisse le navigateur générer le Content-Type
     */
    getHeaders(isFormData = false, customHeaders = {}) {
        const headers = {
            'Accept': 'application/json',
            ...customHeaders,
        };

        // On n'ajoute le Content-Type JSON que si ce n'est pas du FormData
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Gestion centralisée des réponses
     */
    async handleResponse(response) {
        if (response.status === 204) return null;

        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        let data;
        try {
            data = isJson ? await response.json() : await response.text();
        } catch {
            data = null;
        }

        if (!response.ok) {
            const error = {
                status: response.status,
                message: data?.message || 'Une erreur est survenue sur le serveur',
                errors: data?.errors || null,
            };

            // Auto-nettoyage en cas de token expiré
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }

            throw error;
        }

        return data;
    }

    /**
     * GET Request
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
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
     * POST Request (Gère JSON et FormData auto)
     */
    async post(endpoint, body = {}) {
        const isFormData = body instanceof FormData;

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(isFormData),
            body: isFormData ? body : JSON.stringify(body),
        });
        return this.handleResponse(response);
    }

    /**
     * UPLOAD (Alias sémantique pour POST avec FormData)
     * Utile pour la clarté du code
     */
    async upload(endpoint, formData) {
        if (!(formData instanceof FormData)) {
            throw new Error("La méthode upload nécessite un objet FormData");
        }
        return this.post(endpoint, formData);
    }

    /**
     * PUT Request
     * Note: Pour envoyer des fichiers en PUT avec Laravel, 
     * utilisez plutôt POST avec formData.append('_method', 'PUT')
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
     * DOWNLOAD
     * Retourne un Blob (pour PDF, images, etc.)
     */
    async download(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                status: response.status,
                message: errorData.message || 'Erreur lors du téléchargement'
            };
        }

        return response.blob();
    }
}

const apiClient = new ApiClient();
export default apiClient;