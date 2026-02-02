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
    return 'Non défini';
};

/**
 * Filtre les annonces par type et recherche
 */
export const filterAnnonces = (annonces, activeTab, searchQuery) => {
    return annonces.filter((annonce) => {
        if (activeTab !== 'all' && annonce.type.code !== activeTab) return false;

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
    return annonces.filter(a => a.type.code === typeCode).length;
};

/**
 * Obtient les stats des annonces
 */
export const getAnnonceStats = (annonces) => {
    return {
        totalEnvoyees: annonces.filter(a => a.is_active).length,
        totalBrouillons: annonces.filter(a => !a.is_active).length,
        total: annonces.length
    };
};

/**
 * Obtient le label de statut pour une annonce
 */
export const getAnnonceStatusLabel = (isActive) => {
    return isActive ? 'Envoyé' : 'Brouillon';
};

/**
 * Obtient la variante de badge pour le statut
 */
export const getAnnonceStatusVariant = (isActive) => {
    return isActive ? 'success' : 'warning';
};
