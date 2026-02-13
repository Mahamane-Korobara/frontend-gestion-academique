import { MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function DocumentActionsMenu({ 
  document, 
  currentUserId, 
  canDelete = false,
  onView, 
  onDownload, 
  onDelete 
}) {
  // Vérifier si l'utilisateur est le propriétaire (pour la suppression)
  const isOwner = document?.expediteur_id === currentUserId;
  
  // L'utilisateur peut supprimer s'il a la permission ET qu'il est propriétaire
  const canDeleteDocument = canDelete && isOwner;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(document)}>
          <Eye className="w-4 h-4 mr-2" />
          Voir les détails
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onDownload(document)}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </DropdownMenuItem>
        
        {canDeleteDocument && (
          <DropdownMenuItem 
            onClick={() => onDelete(document)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}