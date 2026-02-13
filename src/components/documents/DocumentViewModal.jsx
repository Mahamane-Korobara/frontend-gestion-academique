import { getTypeIcon, getTypeLabel } from '@/lib/utils/documentHelpers';

export default function DocumentViewModal({ document }) {
  if (!document) return null;

  return (
    <div className="space-y-4">
      {/* En-tête avec icône et type */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{getTypeIcon(document.type)}</span>
        <div>
          <span className="text-sm font-bold uppercase px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {getTypeLabel(document.type)}
          </span>
          <p className="text-xs text-gray-500 mt-1">{document.fichier_original}</p>
        </div>
      </div>

      {/* Titre et Description */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 mb-1">Titre</h4>
        <p className="text-lg font-bold text-gray-900">{document.titre}</p>
      </div>

      {document.description && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-1">Description</h4>
          <p className="text-sm text-gray-600">{document.description}</p>
        </div>
      )}

      {/* Informations du Cours */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Informations du cours</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Cours:</span>
            <span className="text-sm font-medium text-gray-900">
              {document.cours?.titre} ({document.cours?.code})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Niveau:</span>
            <span className="text-sm font-medium text-gray-900">{document.niveau}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Filière:</span>
            <span className="text-sm font-medium text-gray-900">{document.filiere}</span>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Métadonnées</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Taille:</span>
            <p className="font-medium text-gray-900">{document.taille}</p>
          </div>
          <div>
            <span className="text-gray-500">Date d'ajout:</span>
            <p className="font-medium text-gray-900">{document.created_at}</p>
          </div>
          <div>
            <span className="text-gray-500">Partagé par:</span>
            <p className="font-medium text-gray-900">{document.expediteur}</p>
          </div>
          {document.date_expiration && (
            <div>
              <span className="text-gray-500">Expire le:</span>
              <p className="font-medium text-gray-900">{document.date_expiration}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}