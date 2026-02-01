'use client';

import { Eye, Edit, Trash2 } from 'lucide-react';
import ActionsMenu from '@/components/partage/ActionsMenu';

/**
 * Menu d'actions pour les annonces (wrapper du composant générique ActionsMenu)
 * @param {Object} annonce - Objet annonce
 * @param {Function} onView - Callback pour voir les détails
 * @param {Function} onEdit - Callback pour modifier
 * @param {Function} onDelete - Callback pour supprimer
 */
export default function AnnonceActionsMenu({ 
  annonce,
  onView,
  onEdit,
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
      type: 'separator'
    },
    {
      icon: Trash2,
      label: 'Supprimer',
      onClick: onDelete,
      variant: 'destructive'
    }
  ];

  return <ActionsMenu item={annonce} actions={actions} />;
}
