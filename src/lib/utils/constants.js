// URLs
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

import { BookOpen, Users, FlaskConical, GraduationCap } from 'lucide-react';

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

// Valeurs exactes de l'enum JourSemaine PHP (majuscule)
export const JOURS = [
    { value: 'Lundi', label: 'Lundi' },
    { value: 'Mardi', label: 'Mardi' },
    { value: 'Mercredi', label: 'Mercredi' },
    { value: 'Jeudi', label: 'Jeudi' },
    { value: 'Vendredi', label: 'Vendredi' },
    { value: 'Samedi', label: 'Samedi' },
];

// Valeurs exactes de l'enum TypeSeance PHP (minuscule)
export const TYPES_SEANCE = [
    { value: 'cours', label: 'Cours magistral' },
    { value: 'td', label: 'Travaux Dirigés' },
    { value: 'tp', label: 'Travaux Pratiques' },
    { value: 'examen', label: 'Examen' },
];

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

export const JOURS_ORDRE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const JOURS_COURTS = { Lundi: 'Lun', Mardi: 'Mar', Mercredi: 'Mer', Jeudi: 'Jeu', Vendredi: 'Ven', Samedi: 'Sam' };

export const TYPE_STYLES = {
    blue: { card: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    green: { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    purple: { card: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
    red: { card: 'bg-rose-50 border-rose-200', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
};
export const TYPE_LABELS = { blue: 'Cours', green: 'TD', purple: 'TP', red: 'Examen' };
export const TYPE_ICONS = { cours: BookOpen, td: Users, tp: FlaskConical, examen: GraduationCap };


// Pagination
export const ITEMS_PER_PAGE = parseInt(
    process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '10'
);

// Routes publiques (pas besoin d'auth)
export const PUBLIC_ROUTES = ['/login', '/'];

// Routes par rôle
export const ROLE_ROUTES = {
    [USER_ROLES.ADMIN]: '/dashboard',
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