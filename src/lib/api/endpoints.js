import apiClient from './client';

// ============================================
// AUTH
// ============================================
export const authAPI = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    logoutAll: () => apiClient.post('/auth/logout-all'),
    me: () => apiClient.get('/auth/me'),
    changePassword: (data) => apiClient.post('/auth/change-password', data),
    updateProfile: (data) => apiClient.post('/auth/update-profile', data),
    getSessions: () => apiClient.get('/auth/sessions'),
    revokeSession: (tokenId) => apiClient.delete(`/auth/sessions/${tokenId}`),
};

// ============================================
// ADMIN - UTILISATEURS
// ============================================
export const usersAPI = {
    getAll: (params) => apiClient.get('/admin/users', params),
    getById: (id) => apiClient.get(`/admin/users/${id}`),
    create: (data) => apiClient.post('/admin/users', data),
    update: (id, data) => apiClient.put(`/admin/users/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/users/${id}`),
    resetPassword: (id) => apiClient.post(`/admin/users/${id}/reset-password`),
    toggleActive: (id) => apiClient.post(`/admin/users/${id}/toggle-active`),
};

// ============================================
// ADMIN - FILIÈRES
// ============================================
export const filieresAPI = {
    getAll: (params) => apiClient.get('/admin/filieres', params),
    getById: (id) => apiClient.get(`/admin/filieres/${id}`),
    create: (data) => apiClient.post('/admin/filieres', data),
    update: (id, data) => apiClient.put(`/admin/filieres/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/filieres/${id}`),
    createStandardLevels: (id) => apiClient.post(`/admin/filieres/${id}/create-standard-levels`),
};

// ============================================
// ADMIN - NIVEAUX
// ============================================
export const niveauxAPI = {
    getAll: () => apiClient.get('/admin/niveaux/all'),
    getByFiliere: (filiereId) => apiClient.get('/admin/niveaux', { filiere_id: filiereId }),
    getById: (id) => apiClient.get(`/admin/niveaux/${id}`),
    create: (data) => apiClient.post('/admin/niveaux', data),
    update: (id, data) => apiClient.put(`/admin/niveaux/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/niveaux/${id}`),
};

// ============================================
// ADMIN - COURS
// ============================================
export const coursAPI = {
    getAll: (params) => apiClient.get('/admin/cours', params),
    getById: (id) => apiClient.get(`/admin/cours/${id}`),
    create: (data) => apiClient.post('/admin/cours', data),
    update: (id, data) => apiClient.put(`/admin/cours/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/cours/${id}`),
    affecterProfesseurs: (coursId, data) => apiClient.post(`/admin/cours/${coursId}/affecter-professeurs`, data),
    retirerProfesseur: (coursId, professeurId) => apiClient.delete(`/admin/cours/${coursId}/professeurs/${professeurId}`),
};

// ============================================
// ADMIN - ANNÉES ACADÉMIQUES
// ============================================
export const anneesAcademiquesAPI = {
    getAll: () => apiClient.get('/admin/annees-academiques'),
    getActive: () => apiClient.get('/admin/annees-academiques/active'),
    getById: (id) => apiClient.get(`/admin/annees-academiques/${id}`),
    create: (data) => apiClient.post('/admin/annees-academiques', data),
    update: (id, data) => apiClient.put(`/admin/annees-academiques/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/annees-academiques/${id}`),
    activate: (id) => apiClient.post(`/admin/annees-academiques/${id}/activate`),
    close: (id) => apiClient.post(`/admin/annees-academiques/${id}/close`),
    createSemestres: (id) => apiClient.post(`/admin/annees-academiques/${id}/create-semestres`),
};

// ============================================
// ADMIN - SEMESTRES
// ============================================
export const semestresAPI = {
    getAll: (params) => apiClient.get('/admin/semestres', params),
    getActive: () => apiClient.get('/admin/semestres/active'),
    getById: (id) => apiClient.get(`/admin/semestres/${id}`),
    create: (data) => apiClient.post('/admin/semestres', data),
    update: (id, data) => apiClient.put(`/admin/semestres/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/semestres/${id}`),
    activate: (id) => apiClient.post(`/admin/semestres/${id}/activate`),
};

// ============================================
// ADMIN - INSCRIPTIONS
// ============================================
export const inscriptionsAPI = {
    getAll: (params) => apiClient.get('/admin/inscriptions', params),
    create: (data) => apiClient.post('/admin/inscriptions', data),
    createMasse: (data) => apiClient.post('/admin/inscriptions/masse', data),
    getByEtudiant: (etudiantId) => apiClient.get(`/admin/inscriptions/etudiant/${etudiantId}`),
    getByCours: (coursId) => apiClient.get(`/admin/inscriptions/cours/${coursId}`),
    delete: (id) => apiClient.delete(`/admin/inscriptions/${id}`),
    inscrireCoursNiveau: (etudiantId, data) => apiClient.post(`/admin/etudiants/${etudiantId}/inscrire-cours-niveau`, data),
};

// ============================================
// ADMIN - ÉVALUATIONS
// ============================================
export const evaluationsAPI = {
    getAll: () => apiClient.get('/admin/evaluations'),
    getByCours: (coursId) => apiClient.get(`/admin/evaluations/cours/${coursId}`),
    getById: (id) => apiClient.get(`/admin/evaluations/${id}`),
    create: (coursId, data) => apiClient.post(`/admin/evaluations/cours/${coursId}`, data),
    update: (id, data) => apiClient.put(`/admin/evaluations/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/evaluations/${id}`),
};

// ============================================
// ADMIN - NOTES
// ============================================
export const notesAdminAPI = {
    valider: (noteId) => apiClient.patch(`/admin/notes/${noteId}/valider`),
    getEnAttente: (params) => apiClient.get('/admin/notes/en-attente', params),
    validerMasse: (data) => apiClient.post('/admin/notes/valider-masse', data),
};

// ============================================
// ADMIN - BULLETINS
// ============================================
export const bulletinsAdminAPI = {
    getAll: (params) => apiClient.get('/admin/bulletins', params),
    genererSemestre: (etudiantId, semestreId) => apiClient.post(`/admin/bulletins/etudiants/${etudiantId}/semestres/${semestreId}/generer`),
    getSemestre: (etudiantId, semestreId) => apiClient.get(`/admin/bulletins/etudiants/${etudiantId}/semestres/${semestreId}`),
    genererAnnuel: (etudiantId, anneeId) => apiClient.post(`/admin/bulletins/etudiants/${etudiantId}/annees/${anneeId}/generer`),
    getAnnuel: (etudiantId, anneeId) => apiClient.get(`/admin/bulletins/etudiants/${etudiantId}/annees/${anneeId}`),
};

// ============================================
// ADMIN - EMPLOIS DU TEMPS
// ============================================
export const emploiDuTempsAdminAPI = {
    getAll: (params) => apiClient.get('/admin/emplois-du-temps', params),
    create: (data) => apiClient.post('/admin/emplois-du-temps', data),
    delete: (id) => apiClient.delete(`/admin/emplois-du-temps/${id}`),
    getByNiveau: (niveauId, params) => apiClient.get(`/admin/emplois-du-temps/niveau/${niveauId}`, params),
    getProfsDisponibles: (params) => apiClient.get('/admin/emplois-du-temps/profs-disponibles', params),
    getCoursDisponibles: (params) => apiClient.get('/admin/emplois-du-temps/cours-disponibles', params),
};

// ============================================
// ADMIN - ANNONCES
// ============================================
export const annoncesAdminAPI = {
    getAll: (params) => apiClient.get('/admin/annonces', params),
    getById: (id) => apiClient.get(`/admin/annonces/${id}`),
    create: (data) => apiClient.post('/admin/annonces', data),
    update: (id, data) => apiClient.put(`/admin/annonces/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/annonces/${id}`),
    toggleActive: (id) => apiClient.post(`/admin/annonces/${id}/toggle-active`),
};

// ============================================
// ADMIN - DASHBOARD
// ============================================
export const dashboardAdminAPI = {
    getStats: () => apiClient.get('/admin/dashboard'),
};

// ============================================
// PROFESSEUR
// ============================================
export const professeurAPI = {
    getAll: (params) => apiClient.get('/professeur/directory', params),
    getDashboard: () => apiClient.get('/professeur/dashboard'),
    getMesCours: () => apiClient.get('/professeur/cours'),
    getFormOptions: () => apiClient.get('/professeur/form-options'),
    saisirNotes: (evaluationId, data) => apiClient.post(`/professeur/evaluations/${evaluationId}/notes`, data),
};

// ============================================
// PROFESSEUR - EMPLOI DU TEMPS
// ============================================
export const emploiDuTempsProfesseurAPI = {
    getAll: () => apiClient.get('/professeur/emploi-du-temps'),
    getSemaine: (params) => apiClient.get('/professeur/emploi-du-temps/semaine', params),
    getJour: (params) => apiClient.get('/professeur/emploi-du-temps/jour', params),
    getResume: () => apiClient.get('/professeur/emploi-du-temps/resume'),
    getMesNiveaux: () => apiClient.get('/professeur/emploi-du-temps/niveaux'),
};

// ============================================
// PROFESSEUR - ANNONCES
// ============================================
export const annoncesProfesseurAPI = {
    getAll: (params) => apiClient.get('/professeur/annonces', params),
    getById: (id) => apiClient.get(`/professeur/annonces/${id}`),
    create: (data) => apiClient.post('/professeur/annonces', data),
    update: (id, data) => apiClient.put(`/professeur/annonces/${id}`, data),
    delete: (id) => apiClient.delete(`/professeur/annonces/${id}`),
    toggleActive: (id) => apiClient.post(`/professeur/annonces/${id}/toggle-active`),
};

// ============================================
// ÉTUDIANT
// ============================================
export const etudiantAPI = {
    getDashboard: () => apiClient.get('/etudiant/dashboard'),
    getBulletins: () => apiClient.get('/etudiant/bulletins'),
    getNotes: (params) => apiClient.get('/etudiant/notes', params),
    getCours: () => apiClient.get('/etudiant/cours'),
    downloadBulletin: (bulletinId) => apiClient.download(`/etudiant/bulletins/${bulletinId}/pdf`),
};

// ============================================
// ÉTUDIANT - EMPLOI DU TEMPS
// ============================================
export const emploiDuTempsEtudiantAPI = {
    getAll: () => apiClient.get('/etudiant/emploi-du-temps'),
    getSemaine: (params) => apiClient.get('/etudiant/emploi-du-temps/semaine', params),
    getJour: (params) => apiClient.get('/etudiant/emploi-du-temps/jour', params),
    getResume: () => apiClient.get('/etudiant/emploi-du-temps/resume'),
    getProchains: (params) => apiClient.get('/etudiant/emploi-du-temps/prochains', params),
};

// ============================================
// ÉTUDIANT - ANNONCES
// ============================================
export const annoncesEtudiantAPI = {
    getAll: (params) => apiClient.get('/etudiant/annonces', params),
};

// ============================================
// MESSAGES (COMMUN)
// ============================================
export const messagesAPI = {
    getAll: (params) => apiClient.get('/messages', params),
    getSent: (params) => apiClient.get('/messages/sent', params),
    getConversation: (userId) => apiClient.get(`/messages/conversation/${userId}`),
    getUnreadCount: () => apiClient.get('/messages/unread-count'),
    getById: (id) => apiClient.get(`/messages/${id}`),
    create: (data) => apiClient.post('/messages', data),
    reply: (id, data) => apiClient.post(`/messages/${id}/reply`, data),
    markAsRead: (id) => apiClient.post(`/messages/${id}/mark-as-read`),
    delete: (id) => apiClient.delete(`/messages/${id}`),
    createMasse: (data) => apiClient.post('/professeur/messages/masse', data),
};

// ============================================
// PROFESSEUR - DOCUMENTS
// ============================================
export const documentsAPI = {
    getAll: (params) => apiClient.get('/professeur/documents', params),
    create: (data) => apiClient.post('/professeur/documents', data, true),
    delete: (id) => apiClient.delete(`/professeur/documents/${id}`),
    download: (id) => apiClient.download(`/professeur/documents/${id}/download`),
};

// ============================================
// ETUDIANTS - DOCUMENTS
// ============================================

export const documentsEtudiantAPI = {
    getAll: (params) => apiClient.get('/etudiant/documents', params),
    download: (id) => apiClient.download(`/etudiant/documents/${id}/download`),
};