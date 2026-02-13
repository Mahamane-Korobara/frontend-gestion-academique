/**
 * Fichier de fonctions utilitaires pour la gestion des documents
 */

// ============ ICÔNES ET LABELS ============

/**
 * Retourne l'emoji correspondant au type de document
 */
export const getTypeIcon = (type) => {
    const icons = {
        pdf: '📄',
        word: '📝',
        excel: '📊',
        powerpoint: '📽️',
        image: '🖼️',
    };
    return icons[type] || '📎';
};

/**
 * Retourne le label du type de document
 */
export const getTypeLabel = (type) => {
    const labels = {
        pdf: 'PDF',
        word: 'Word',
        excel: 'Excel',
        powerpoint: 'PowerPoint',
        image: 'Image',
    };
    return labels[type] || 'Document';
};

// ============ FILTRAGE ============

/**
 * Filtre les documents par type et recherche
 */
export const filterDocuments = (documents, activeTab, searchQuery) => {
    if (!Array.isArray(documents)) return [];

    let filtered = documents;

    // Filtrer par type
    if (activeTab !== 'tous') {
        filtered = filtered.filter((doc) => doc.type === activeTab);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter((doc) => {
            return (
                doc.titre?.toLowerCase().includes(searchLower) ||
                doc.description?.toLowerCase().includes(searchLower) ||
                doc.cours?.titre?.toLowerCase().includes(searchLower) ||
                doc.cours?.code?.toLowerCase().includes(searchLower)
            );
        });
    }

    return filtered;
};

// ============ COMPTAGE ============

/**
 * Compte le nombre de documents par type
 */
export const countDocumentsByType = (documents, type) => {
    if (!Array.isArray(documents)) return 0;
    return documents.filter((doc) => doc.type === type).length;
};

// ============ STATISTIQUES ============

/**
 * Calcule les statistiques des documents
 */
export const getDocumentStats = (documents) => {
    if (!Array.isArray(documents)) {
        return {
            totalDocuments: 0,
            espaceUtilise: '0 MB',
            documentsCeMois: 0,
        };
    }

    // Total de documents
    const totalDocuments = documents.length;

    // Espace utilisé (convertir les tailles en MB)
    const totalSize = documents.reduce((acc, doc) => {
        // La taille est déjà formatée (ex: "2.5 MB"), on doit l'extraire
        const sizeMatch = doc.taille?.match(/(\d+\.?\d*)\s*(B|KB|MB|GB)/);
        if (sizeMatch) {
            let size = parseFloat(sizeMatch[1]);
            const unit = sizeMatch[2];

            // Convertir en MB
            if (unit === 'B') size = size / (1024 * 1024);
            else if (unit === 'KB') size = size / 1024;
            else if (unit === 'GB') size = size * 1024;

            return acc + size;
        }
        return acc;
    }, 0);

    const espaceUtilise = totalSize > 1024
        ? `${(totalSize / 1024).toFixed(2)} GB`
        : `${totalSize.toFixed(2)} MB`;

    // Documents de ce mois
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const documentsCeMois = documents.filter((doc) => {
        if (!doc.created_at) return false;

        // Parser la date (format: dd/MM/yyyy)
        const parts = doc.created_at.split('/');
        if (parts.length !== 3) return false;

        const docMonth = parseInt(parts[1]) - 1; // Les mois commencent à 0
        const docYear = parseInt(parts[2]);

        return docMonth === currentMonth && docYear === currentYear;
    }).length;

    return {
        totalDocuments,
        espaceUtilise,
        documentsCeMois,
    };
};

// ============ VALIDATION ============

/**
 * Valide la taille d'un fichier
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
};

/**
 * Valide le type MIME d'un fichier
 */
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

/**
 * Formate la taille d'un fichier en octets vers une chaîne lisible
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size > 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// ============ TÉLÉCHARGEMENT ============

/**
 * Télécharge un document via le navigateur
 */
export const downloadDocument = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop() || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};