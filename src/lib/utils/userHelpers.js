/**
 * Obtient le matricule ou code d'un utilisateur
 */
export const getUserIdentifier = (user) => {
    if (!user?.profile) return 'N/A';
    return user.profile.matricule || user.profile.code || 'N/A';
};

/**
 * Obtient la filière ou spécialité d'un utilisateur
 */
export const getUserDepartment = (user) => {
    if (!user?.profile) return 'Non défini';
    return user.profile.filiere || user.profile.specialite || 'Non défini';
};

/**
 * Obtient le statut d'un utilisateur
 */
export const getUserStatus = (user) => {
    if (!user?.profile) return '--';
    return user.profile.statut || '--';
};

/**
 * Filtre les utilisateurs par rôle
 */
export const filterUsersByRole = (users, role) => {
    return users.filter(user => user.role?.name === role);
};

/**
 * Compte les utilisateurs par rôle
 */
export const countUsersByRole = (users, role) => {
    return filterUsersByRole(users, role).length;
};

/**
 * Filtre les utilisateurs (recherche + filtres)
 */
export const filterUsers = (users, role, searchQuery, selectedFilters = {}) => {
    return users.filter((user) => {
        // Exclure les admins
        if (user.role?.name === 'admin') return false;

        // Filtrer par rôle
        if (user.role?.name !== role) return false;

        // Recherche
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            getUserIdentifier(user).toLowerCase().includes(searchLower);

        // Filtres supplémentaires
        const matchesFilters = Object.entries(selectedFilters).every(([key, value]) => {
            if (!value || value === 'all') return true;
            const profileValue = user.profile?.[key]?.toLowerCase();
            return profileValue === value.toLowerCase();
        });

        return matchesSearch && matchesFilters;
    });
};

/**
 * Obtient l'année d'inscription
 */
export const getRegistrationYear = (user) => {
    if (!user?.created_at) return '2025';
    return new Date(user.created_at).getFullYear().toString();
};

/**
 * Obtient les options de filtres selon le rôle
 */
export const getFilterOptionsByRole = (role, filieresOptions) => {
    const statusOptions = [
        { value: 'actif', label: 'Actif' },
        { value: 'inactif', label: 'Inactif' }
    ];

    if (role === 'etudiant') {
        return [
            { key: 'filiere', placeholder: 'Filière', options: filieresOptions },
            { key: 'statut', placeholder: 'Statut', options: statusOptions }
        ];
    }

    return [
        { key: 'specialite', placeholder: 'Spécialité', options: filieresOptions },
        { key: 'statut', placeholder: 'Statut', options: statusOptions }
    ];
};