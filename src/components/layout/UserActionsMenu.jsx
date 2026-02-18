'use client';

import { Eye, Edit, MessageSquare, Lock, Trash2, BookPlus } from 'lucide-react';
import ActionsMenu from '@/components/partage/ActionsMenu';

/**
 * Détecte si l'utilisateur est un étudiant.
 * Dans l'API, role est un objet : { id, name, display_name }
 */
function isEtudiant(user) {
    if (!user) return false;
    // ✅ Structure réelle de l'API : user.role.name
    if (user.role?.name === 'etudiant')  return true;
    // Fallbacks pour d'autres structures possibles
    if (user.role === 'etudiant')        return true;
    if (user.profile?.type === 'etudiant') return true;
    return false;
}

export default function UserActionsMenu({
    user,
    onView,
    onEdit,
    onSendMessage,
    onResetPassword,
    onInscrireNiveau,
    onDelete,
}) {
    const userIsEtudiant = isEtudiant(user);

    const actions = [
        {
            icon: Eye,
            label: 'Voir les détails',
            onClick: onView,
        },
        {
            icon: Edit,
            label: 'Modifier',
            onClick: onEdit,
        },
        
        // ACTION EN SUSPENS : Commentée temporairement pour masquer l'option
        /* ...(userIsEtudiant
            ? [{
                icon: BookPlus,
                label: 'Inscrire à un niveau',
                onClick: onInscrireNiveau,
              }]
            : []
        ),
        */

        {
            icon: MessageSquare,
            label: 'Envoyer un message',
            onClick: onSendMessage,
        },
        {
            icon: Lock,
            label: 'Réinitialiser MDP',
            onClick: onResetPassword,
        },
        { type: 'separator' },
        {
            icon: Trash2,
            label: 'Supprimer',
            onClick: onDelete,
            variant: 'destructive',
        },
    ];

    return <ActionsMenu item={user} actions={actions} />;
}