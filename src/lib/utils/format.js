import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formater une date
 * @param {string|Date} date - Date à formater
 * @param {string} formatStr - Format de sortie (défaut: 'dd/MM/yyyy')
 * @returns {string} - Date formatée
 */
export function formatDate(date, formatStr = 'dd/MM/yyyy') {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '-';
        return format(dateObj, formatStr, { locale: fr });
    } catch (error) {
        console.error('Erreur formatDate:', error);
        return '-';
    }
}

/**
 * Formater une date et heure
 * @param {string|Date} datetime - Date/heure à formater
 * @returns {string} - Date et heure formatées
 */
export function formatDateTime(datetime) {
    return formatDate(datetime, 'dd/MM/yyyy HH:mm');
}

/**
 * Formater une heure
 * @param {string|Date} time - Heure à formater
 * @returns {string} - Heure formatée
 */
export function formatTime(time) {
    if (!time) return '-';

    try {
        // Si c'est une string au format HH:mm:ss
        if (typeof time === 'string' && time.includes(':')) {
            return time.substring(0, 5); // Retourne HH:mm
        }

        return formatDate(time, 'HH:mm');
    } catch (error) {
        return time;
    }
}

/**
 * Formater un nombre avec séparateurs de milliers
 * @param {number} number - Nombre à formater
 * @param {number} decimals - Nombre de décimales (défaut: 0)
 * @returns {string} - Nombre formaté
 */
export function formatNumber(number, decimals = 0) {
    if (number === null || number === undefined) return '-';

    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(number);
}

/**
 * Formater une note sur 20
 * @param {number} note - Note à formater
 * @returns {string} - Note formatée
 */
export function formatNote(note) {
    if (note === null || note === undefined) return '-';
    return `${formatNumber(note, 2)}/20`;
}

/**
 * Formater un pourcentage
 * @param {number} value - Valeur à formater
 * @returns {string} - Pourcentage formaté
 */
export function formatPercent(value) {
    if (value === null || value === undefined) return '-';
    return `${formatNumber(value, 1)}%`;
}

/**
 * Formater une durée en heures/minutes
 * @param {number} minutes - Durée en minutes
 * @returns {string} - Durée formatée
 */
export function formatDuration(minutes) {
    if (!minutes) return '-';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}`;
}

/**
 * Tronquer un texte
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur max (défaut: 50)
 * @returns {string} - Texte tronqué
 */
export function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Capitaliser la première lettre
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} - Chaîne capitalisée
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formater un nom complet
 * @param {string} prenom - Prénom
 * @param {string} nom - Nom
 * @returns {string} - Nom complet formaté
 */
export function formatFullName(prenom, nom) {
    if (!prenom && !nom) return '-';
    return `${capitalize(prenom || '')} ${nom?.toUpperCase() || ''}`.trim();
}

/**
 * Formater une taille de fichier
 * @param {number} bytes - Taille en bytes
 * @returns {string} - Taille formatée
 */
export function formatFileSize(bytes) {
    if (!bytes) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formater une année académique
 * @param {string} dateDebut - Date de début
 * @param {string} dateFin - Date de fin
 * @returns {string} - Année académique formatée (ex: "2024-2025")
 */
export function formatAnneeAcademique(dateDebut, dateFin) {
    if (!dateDebut || !dateFin) return '-';

    try {
        const anneeDebut = new Date(dateDebut).getFullYear();
        const anneeFin = new Date(dateFin).getFullYear();
        return `${anneeDebut}-${anneeFin}`;
    } catch (error) {
        return '-';
    }
}