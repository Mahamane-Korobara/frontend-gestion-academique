/**
 * Fichier de fonctions utilitaires pour la gestion des documents
 */

// ============ ICÔNES ET LABELS ============

/**
 * Retourne l'emoji correspondant au type de document
 */
const EXTENSION_PRESENTATION = {
    // Code & data science
    py: { label: 'Python', icon: '🐍', color: 'text-blue-600', category: 'code' },
    r: { label: 'R', icon: 'Ⓡ', color: 'text-gray-600', category: 'code' },
    ipynb: { label: 'Notebook', icon: '📓', color: 'text-orange-600', category: 'code' },
    do: { label: 'Stata', icon: '📊', color: 'text-blue-700', category: 'code' },
    dta: { label: 'Stata', icon: '📊', color: 'text-blue-700', category: 'data' },
    sav: { label: 'SPSS', icon: '📊', color: 'text-indigo-600', category: 'data' },
    sas7bdat: { label: 'SAS', icon: '📊', color: 'text-blue-500', category: 'data' },
    rds: { label: 'R Data', icon: '🧪', color: 'text-gray-600', category: 'data' },
    rdata: { label: 'R Data', icon: '🧪', color: 'text-gray-600', category: 'data' },
    tex: { label: 'LaTeX', icon: '📄', color: 'text-slate-700', category: 'code' },
    sql: { label: 'SQL', icon: '🗄️', color: 'text-emerald-700', category: 'code' },

    // Documents
    pdf: { label: 'PDF', icon: '📄', color: 'text-red-600', category: 'docs' },
    doc: { label: 'Word', icon: '📝', color: 'text-blue-600', category: 'docs' },
    docx: { label: 'Word', icon: '📝', color: 'text-blue-600', category: 'docs' },
    odt: { label: 'Document', icon: '📝', color: 'text-blue-500', category: 'docs' },
    rtf: { label: 'Document', icon: '📝', color: 'text-blue-500', category: 'docs' },
    txt: { label: 'Texte', icon: '📃', color: 'text-gray-600', category: 'docs' },

    // Tableurs / data
    xls: { label: 'Excel', icon: '📊', color: 'text-green-700', category: 'data' },
    xlsx: { label: 'Excel', icon: '📊', color: 'text-green-700', category: 'data' },
    ods: { label: 'Tableur', icon: '📊', color: 'text-green-600', category: 'data' },
    csv: { label: 'CSV', icon: '🧾', color: 'text-green-600', category: 'data' },
    tsv: { label: 'TSV', icon: '🧾', color: 'text-green-600', category: 'data' },
    parquet: { label: 'Parquet', icon: '🧾', color: 'text-green-600', category: 'data' },

    // Slides
    ppt: { label: 'PowerPoint', icon: '📽️', color: 'text-orange-600', category: 'slides' },
    pptx: { label: 'PowerPoint', icon: '📽️', color: 'text-orange-600', category: 'slides' },
    odp: { label: 'Présentation', icon: '📽️', color: 'text-orange-500', category: 'slides' },

    // Images
    jpg: { label: 'Image', icon: '🖼️', color: 'text-pink-600', category: 'images' },
    jpeg: { label: 'Image', icon: '🖼️', color: 'text-pink-600', category: 'images' },
    png: { label: 'Image', icon: '🖼️', color: 'text-pink-600', category: 'images' },
    gif: { label: 'Image', icon: '🖼️', color: 'text-pink-600', category: 'images' },
    webp: { label: 'Image', icon: '🖼️', color: 'text-pink-600', category: 'images' },
    svg: { label: 'Image', icon: '🖼️', color: 'text-pink-600', category: 'images' },

    // Archives
    zip: { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },
    rar: { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },
    '7z': { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },
    tar: { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },
    gz: { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },
    bz2: { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },
    xz: { label: 'Archive', icon: '🗜️', color: 'text-amber-700', category: 'archives' },

    // Audio/Video
    mp3: { label: 'Audio', icon: '🎵', color: 'text-indigo-600', category: 'audio' },
    wav: { label: 'Audio', icon: '🎵', color: 'text-indigo-600', category: 'audio' },
    ogg: { label: 'Audio', icon: '🎵', color: 'text-indigo-600', category: 'audio' },
    flac: { label: 'Audio', icon: '🎵', color: 'text-indigo-600', category: 'audio' },
    mp4: { label: 'Vidéo', icon: '🎬', color: 'text-purple-600', category: 'video' },
    mkv: { label: 'Vidéo', icon: '🎬', color: 'text-purple-600', category: 'video' },
    mov: { label: 'Vidéo', icon: '🎬', color: 'text-purple-600', category: 'video' },
    avi: { label: 'Vidéo', icon: '🎬', color: 'text-purple-600', category: 'video' },
    webm: { label: 'Vidéo', icon: '🎬', color: 'text-purple-600', category: 'video' },
};

const normalizeExtension = (input) => {
    if (!input) return '';
    if (typeof input === 'string') return input.trim().toLowerCase();
    return String(input || '').trim().toLowerCase();
};

export const getDocumentPresentation = (document) => {
    const ext = normalizeExtension(document?.extension);
    return EXTENSION_PRESENTATION[ext] || {
        label: ext ? ext.toUpperCase() : 'Document',
        icon: '📎',
        color: 'text-gray-600',
        category: 'autres',
    };
};

export const getDocumentCategory = (document) => {
    return getDocumentPresentation(document).category;
};

export const getTypeIcon = (document) => {
    return getDocumentPresentation(document).icon;
};

/**
 * Retourne le label du type de document
 */
export const getTypeLabel = (document) => {
    return getDocumentPresentation(document).label;
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
        filtered = filtered.filter((doc) => getDocumentCategory(doc) === activeTab);
    }

    // Filtrer par recherche (titre, description, cours, extension, type, mime)
    if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter((doc) => {
            const presentation = getDocumentPresentation(doc);
            const extension = (doc.extension || '').toLowerCase();
            const typeLabel = (presentation.label || '').toLowerCase();
            const mime = (doc.mime_type || '').toLowerCase();
            const originalName = (doc.original_name || '').toLowerCase();
            return (
                doc.titre?.toLowerCase().includes(searchLower) ||
                doc.description?.toLowerCase().includes(searchLower) ||
                doc.cours?.titre?.toLowerCase().includes(searchLower) ||
                doc.cours?.code?.toLowerCase().includes(searchLower) ||
                extension.includes(searchLower) ||
                typeLabel.includes(searchLower) ||
                mime.includes(searchLower) ||
                originalName.includes(searchLower)
            );
        });
    }

    return filtered;
};

// ============ COMPTAGE ============

/**
 * Compte le nombre de documents par type
 */
export const countDocumentsByType = (documents, category) => {
    if (!Array.isArray(documents)) return 0;
    return documents.filter((doc) => getDocumentCategory(doc) === category).length;
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

// (nettoyage) Anciennes helpers de validation/téléchargement retirées (non utilisées)
