'use client';

import { Eye, Edit, Mail, Lock, Trash2 } from 'lucide-react';
import ActionsMenu from '@/components/partage/ActionsMenu';

/**
 * Menu d'actions pour les utilisateurs (wrapper du composant générique ActionsMenu)
 * @param {Object} user - Objet utilisateur
 * @param {Function} onView - Callback pour voir les détails
 * @param {Function} onEdit - Callback pour modifier
 * @param {Function} onSendEmail - Callback pour envoyer un email
 * @param {Function} onResetPassword - Callback pour réinitialiser le mot de passe
 * @param {Function} onDelete - Callback pour supprimer
 */
export default function UserActionsMenu({ 
  user,
  onView,
  onEdit,
  onSendEmail,
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
      icon: Mail,
      label: 'Envoyer un email',
      onClick: onSendEmail,
    },
    {
      icon: Lock,
      label: 'Réinitialiser MDP',
      onClick: onResetPassword,
    },
    {
      type: 'separator'
    },
    {
      icon: Trash2,
      label: 'Supprimer',
      onClick: onDelete,
      variant: 'destructive'
    }
  ];

  return <ActionsMenu item={user} actions={actions} />;
}