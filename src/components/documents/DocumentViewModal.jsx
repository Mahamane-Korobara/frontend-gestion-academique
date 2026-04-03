import { getTypeIcon, getTypeLabel, getDocumentPresentation } from '@/lib/utils/documentHelpers';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const extensionToLanguage = (extension = '') => {
  const ext = extension.toLowerCase();
  const map = {
    py: 'python',
    r: 'r',
    do: 'stata',
    dta: 'stata',
    tex: 'latex',
    sql: 'sql',
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    csv: 'text',
    tsv: 'text',
    md: 'markdown',
    html: 'html',
    css: 'css',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
  };
  return map[ext] || 'text';
};

export default function DocumentViewModal({ document, previewContent, previewLoading, onLoadPreview }) {
  if (!document) return null;
  const presentation = getDocumentPresentation(document);

  return (
    <div className="space-y-4">
      {/* En-tête avec icône et type */}
      <div className="flex items-center gap-3">
        <span className={`text-3xl ${presentation.color}`}>{getTypeIcon(document)}</span>
        <div>
          <span className="text-sm font-bold uppercase px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {getTypeLabel(document)}
          </span>
          <p className="text-xs text-gray-500 mt-1">{document.original_name}</p>
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
            <span className="text-gray-500">Extension:</span>
            <p className="font-medium text-gray-900">{document.extension || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Date d&apos;ajout:</span>
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

      {document.preview_url && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-gray-700">Prévisualisation</h4>
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={onLoadPreview}
              disabled={previewLoading}
            >
              {previewLoading ? 'Chargement...' : 'Charger'}
            </button>
          </div>
          <div className="max-h-64 overflow-auto border rounded bg-gray-50">
            {previewContent ? (
              <SyntaxHighlighter
                language={extensionToLanguage(document.extension)}
                style={oneLight}
                customStyle={{ margin: 0, background: 'transparent' }}
                wrapLongLines
              >
                {previewContent}
              </SyntaxHighlighter>
            ) : (
              <div className="text-xs text-gray-500 p-3">
                Aucun aperçu chargé.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
