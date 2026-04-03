import { getCibleTextFromAnnonce } from '@/lib/utils/annonceHelpers';

export default function AnnonceViewModal({ annonce }) {
  if (!annonce) return null;

  const getPriorityIcon = (priorite) => {
    const icons = { urgente: '⚠️', importante: '📢', normale: 'ℹ️' };
    return icons[priorite?.code] || '📌';
  };

  const auteurName = annonce.auteur?.name || annonce.auteur || '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getPriorityIcon(annonce.priorite)}</span>
        <span className="text-sm font-bold uppercase px-2 py-1 bg-gray-100 rounded" style={{ color: annonce.priorite?.color }}>
          {annonce.priorite?.label}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-700">Message</h4>
        <p className="text-lg font-bold text-gray-900">{annonce.titre}</p>
        <p className="text-sm text-gray-600 mt-2">{annonce.contenu}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
        <div><span className="text-gray-500">Cible:</span> {getCibleTextFromAnnonce(annonce)}</div>
        <div><span className="text-gray-500">Auteur:</span> {auteurName}</div>
      </div>
    </div>
  );
}
