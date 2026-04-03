/**
 * Obtient l'icône de priorité pour une annonce
 */
export const getPriorityIcon = (priorite) => {
    const icons = {
        urgente: '⚠️',
        importante: '📢',
        normale: 'ℹ️'
    };
    return icons[priorite?.code] || '📌';
};

/**
 * Obtient le texte de la cible d'une annonce
 */
export const getCibleText = (cible) => {
    if (!cible) return 'Non défini';
    if (cible.type === 'globale') return 'Globale';
    if (cible.type === 'filiere') return cible.filiere?.nom || 'Filière';
    if (cible.type === 'niveau') {
        return `${cible.niveau?.nom || 'Niveau'} - ${cible.filiere?.nom || ''}`.trim();
    }
    if (cible.type === 'cours') return cible.cours?.titre || 'Cours';
    if (cible.type === 'individuelle') return 'Individuelle';
    return 'Non défini';
};

/**
 * Cible avec fallback si le backend ne renvoie pas "cible" (ex: étudiant)
 */
export const getCibleTextFromAnnonce = (annonce) => {
    if (!annonce) return 'Non défini';
    if (annonce.cible) return getCibleText(annonce.cible);

    const typeCode = normalizeTypeCode(annonce.type);
    if (typeCode === 'globale') return 'Globale';
    if (typeCode === 'filiere') return 'Filière';
    if (typeCode === 'niveau') return 'Niveau';
    if (typeCode === 'cours') return 'Cours';
    if (typeCode === 'individuelle') return 'Individuelle';
    return 'Non défini';
};

/**
 * Normalise le code de type d'annonce (gère différents formats du backend)
 */
const normalizeTypeCode = (type) => {
    if (!type) return null;

    // Si c'est déjà un objet avec code
    if (typeof type === 'object' && type.code) {
        return type.code.toLowerCase().trim();
    }

    // Si c'est un string, normaliser
    if (typeof type === 'string') {
        // D'abord en minuscules et trim
        let normalized = type.toLowerCase().trim();

        // Mappages spécifiques
        const mappings = {
            'par cours': 'cours',
            'par filière': 'filiere',
            'par filiere': 'filiere',
            'par niveau': 'niveau',
            'globale': 'globale',
        };

        // Chercher si on a un mappage exact
        for (const [key, value] of Object.entries(mappings)) {
            if (normalized === key || normalized === key.replace(/\s+/g, '')) {
                return value;
            }
        }

        // Sinon retourner la valeur normalisée
        return normalized;
    }

    return null;
};

/**
 * Filtre les annonces par type et recherche
 */
export const filterAnnonces = (annonces, activeTab, searchQuery) => {
    return annonces.filter((annonce) => {
        const typeCode = normalizeTypeCode(annonce.type);

        if (activeTab !== 'all' && typeCode !== activeTab) return false;

        const searchLower = searchQuery.toLowerCase();
        return (
            annonce.titre?.toLowerCase().includes(searchLower) ||
            annonce.contenu?.toLowerCase().includes(searchLower)
        );
    });
};

/**
 * Compte les annonces par type
 */
export const countAnnoncesByType = (annonces, typeCode) => {
    return annonces.filter(a => {
        const aTypeCode = normalizeTypeCode(a.type);
        return aTypeCode === typeCode;
    }).length;
};

/**
 * Obtient les stats des annonces
 * @param {Array} annonces - Les annonces à analyser
 * @param {number|null} userId - ID de l'utilisateur pour filtrer ses annonces (optionnel)
 */
export const getAnnonceStats = (annonces, userId = null) => {
    // Filtrer les annonces créées par l'utilisateur si userId est fourni
    const userAnnonces = userId
        ? annonces.filter(a => a.auteur?.id === userId)
        : annonces;

    return {
        totalEnvoyees: userAnnonces.filter(a => a.is_active !== false).length,
        totalBrouillons: userAnnonces.filter(a => a.is_active === false).length,
        total: userAnnonces.length
    };
};

/**
 * Obtient le label de statut pour une annonce
 */
export const getAnnonceStatusLabel = (isActive) => {
    return isActive === false ? 'Brouillon' : 'Envoyé';
};

/**
 * Obtient la variante de badge pour le statut
 */
export const getAnnonceStatusVariant = (isActive) => {
    return isActive === false ? 'warning' : 'success';
};
