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
 * Obtient l'année d'inscription
 */
export const getRegistrationYear = (user) => {
    if (!user?.created_at) return '2025';
    return new Date(user.created_at).getFullYear().toString();
};

/**
 * Filtre les utilisateurs (recherche + filtres)
 *
 * selectedFilters exemple :
 *   { filiere: 'INFO', statut: 'actif' }   ← filiere = CODE (ex "INFO")
 */
export const filterUsers = (users, role, searchQuery, selectedFilters = {}) => {
    return users.filter((user) => {

        // Exclure les admins
        if (user.role?.name === 'admin') return false;

        // Filtrer par rôle
        if (user.role?.name !== role) return false;

        // Recherche texte
        const searchLower = (searchQuery ?? '').toLowerCase();
        if (searchLower) {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                getUserIdentifier(user).toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Filtres supplémentaires
        const matchesFilters = Object.entries(selectedFilters).every(([key, value]) => {
            if (!value || value === 'all') return true;

            const profileValue = user.profile?.[key];
            if (profileValue === undefined || profileValue === null) return false;

            return String(profileValue).toLowerCase() === String(value).toLowerCase();
        });

        return matchesFilters;
    });
};

/**
 * Obtient les options de filtres selon le rôle.
 *
 *    Pour les étudiants, key = 'filiere' et les options ont value = filiere.code
 *    car user.profile.filiere est un CODE string (ex "INFO", "MATH").
 *
 * @param {string} role
 * @param {Array}  filieresOptions - [{ value, label, code }] venant de useFilieres
 */
export const getFilterOptionsByRole = (role, filieresOptions = []) => {
    const statusOptions = [
        { value: 'actif', label: 'Actif' },
        { value: 'inactif', label: 'Inactif' },
    ];

    if (role === 'etudiant') {
        return [
            {
                key: 'filiere',
                placeholder: 'Filière',
                options: filieresOptions.map(f => ({
                    value: f.code ?? f.value, // code si dispo, sinon value existante
                    label: f.label,
                })),
            },
            {
                key: 'statut',
                placeholder: 'Statut',
                options: statusOptions,
            },
        ];
    }

    // Professeur
    return [
        {
            key: 'statut',
            placeholder: 'Statut',
            options: statusOptions,
        },
    ];
};