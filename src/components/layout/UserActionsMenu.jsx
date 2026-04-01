'use client';

import { Eye, Edit, MessageSquare, Lock, Trash2 } from 'lucide-react';
import ActionsMenu from '@/components/partage/ActionsMenu';

export default function UserActionsMenu({
    user,
    onView,
    onEdit,
    onSendMessage,
    onResetPassword,
    onDelete,
}) {
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
