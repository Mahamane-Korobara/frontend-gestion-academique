// URLs
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

// Rôles utilisateurs
export const USER_ROLES = {
    ADMIN: 'admin',
    PROFESSEUR: 'professeur',
    ETUDIANT: 'etudiant',
};

// Statuts
export const STATUT_NOTE = {
    BROUILLON: 'brouillon',
    SOUMISE: 'soumise',
    VALIDEE: 'validee',
};

export const STATUT_ETUDIANT = {
    ACTIF: 'actif',
    SUSPENDU: 'suspendu',
    DIPLOME: 'diplome',
};

export const DECISION_BULLETIN = {
    ADMIS: 'admis',
    AJOURNE: 'ajourné',
    RATTRAPAGE: 'rattrapage',
};

// Semestres
export const SEMESTRES = {
    S1: 1,
    S2: 2,
};

// Jours de la semaine
export const JOURS_SEMAINE = {
    LUNDI: 'lundi',
    MARDI: 'mardi',
    MERCREDI: 'mercredi',
    JEUDI: 'jeudi',
    VENDREDI: 'vendredi',
    SAMEDI: 'samedi',
};

// Types d'évaluation
export const TYPES_EVALUATION = {
    CC: 'cc',
    EXAMEN: 'examen',
    PROJET: 'projet',
    TP: 'tp',
};

// Types d'annonce
export const TYPES_ANNONCE = {
    INFO: 'info',
    ALERTE: 'alerte',
    IMPORTANT: 'important',
};

// Priorités d'annonce
export const PRIORITES_ANNONCE = {
    BASSE: 1,
    NORMALE: 2,
    HAUTE: 3,
};

// Pagination
export const ITEMS_PER_PAGE = parseInt(
    process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '10'
);

// Routes publiques (pas besoin d'auth)
export const PUBLIC_ROUTES = ['/login', '/'];

// Routes par rôle
export const ROLE_ROUTES = {
    [USER_ROLES.ADMIN]: '/admin/dashboard',
    [USER_ROLES.PROFESSEUR]: '/professeur/dashboard',
    [USER_ROLES.ETUDIANT]: '/etudiant/dashboard',
};

// Couleurs par statut (pour badges)
export const STATUS_COLORS = {
    // Statuts notes
    brouillon: 'bg-gray-100 text-gray-800',
    soumise: 'bg-blue-100 text-blue-800',
    validee: 'bg-green-100 text-green-800',

    // Statuts étudiants
    actif: 'bg-green-100 text-green-800',
    suspendu: 'bg-red-100 text-red-800',
    diplome: 'bg-purple-100 text-purple-800',

    // Décisions
    admis: 'bg-green-100 text-green-800',
    'ajourné': 'bg-red-100 text-red-800',
    rattrapage: 'bg-orange-100 text-orange-800',
};

// Messages d'erreur
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erreur de connexion au serveur',
    UNAUTHORIZED: 'Session expirée, veuillez vous reconnecter',
    FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
    NOT_FOUND: 'Ressource non trouvée',
    SERVER_ERROR: 'Erreur serveur, veuillez réessayer',
    VALIDATION_ERROR: 'Erreur de validation des données',
};