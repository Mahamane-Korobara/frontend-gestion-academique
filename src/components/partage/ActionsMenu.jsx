'use client';

import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Menu d'actions générique et réutilisable
 * @param {Object} item - L'objet (utilisateur, annonce, cours, etc.)
 * @param {Array} actions - Tableau d'actions à afficher
 * 
 * Structure d'une action:
 * {
 *   icon: IconComponent,
 *   label: 'Texte du menu',
 *   onClick: (item) => {...},
 *   variant: 'default' ou 'destructive' (optionnel)
 * }
 * 
 * Pour un séparateur:
 * { type: 'separator' }
 * 
 * Exemple d'utilisation:
 * <ActionsMenu
 *   item={user}
 *   actions={[
 *     { icon: Edit, label: 'Modifier', onClick: handleEdit },
 *     { type: 'separator' },
 *     { icon: Trash2, label: 'Supprimer', onClick: handleDelete, variant: 'destructive' }
 *   ]}
 * />
 */
export default function ActionsMenu({ 
  item,
  actions = [],
  align = 'end',
  className = 'h-8 w-8'
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${className} text-gray-600 hover:bg-gray-100 rounded-full`}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {actions.map((action, index) => {
          if (action.type === 'separator') {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const Icon = action.icon;
          
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick?.(item)}
              variant={action.variant || 'default'}
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
