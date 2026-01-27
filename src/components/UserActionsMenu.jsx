'use client';

import { Eye, Edit, Mail, Lock, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Menu d'actions réutilisable pour les utilisateurs
 * @param {Object} user - Objet utilisateur
 * @param {Function} onView - Callback pour voir les détails
 * @param {Function} onEdit - Callback pour modifier
 * @param {Function} onSendEmail - Callback pour envoyer un email
 * @param {Function} onResetPassword - Callback pour réinitialiser le mot de passe
 * @param {Function} onDelete - Callback pour supprimer
 * @param {Array} actions - Actions personnalisées à afficher
 */
export default function UserActionsMenu({ 
  user,
  onView,
  onEdit,
  onSendEmail,
  onResetPassword,
  onDelete,
  actions = null // Actions personnalisées optionnelles
}) {
  // Actions par défaut
  const defaultActions = [
    {
      icon: Eye,
      label: 'Voir les détails',
      onClick: () => onView?.(user),
      variant: 'default'
    },
    {
      icon: Edit,
      label: 'Modifier',
      onClick: () => onEdit?.(user),
      variant: 'default'
    },
    {
      icon: Mail,
      label: 'Envoyer un email',
      onClick: () => onSendEmail?.(user),
      variant: 'default'
    },
    {
      icon: Lock,
      label: 'Réinitialiser MDP',
      onClick: () => onResetPassword?.(user),
      variant: 'default'
    },
    {
      type: 'separator'
    },
    {
      icon: Trash2,
      label: 'Supprimer',
      onClick: () => onDelete?.(user),
      variant: 'destructive'
    }
  ];

  const displayActions = actions || defaultActions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {displayActions.map((action, index) => {
          if (action.type === 'separator') {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const Icon = action.icon;
          
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              variant={action.variant}
              className="cursor-pointer"
            >
              <Icon className="w-4 h-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}