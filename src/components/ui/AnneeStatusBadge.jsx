import { Archive, CheckCircle2, XCircle } from 'lucide-react';

export default function AnneeStatusBadge({ annee }) {
    if (annee.is_cloturee) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
            <Archive className="w-3 h-3" /> Clôturée
        </span>
    );
    if (annee.is_active) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="w-3 h-3" /> Active
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
            <XCircle className="w-3 h-3" /> Inactive
        </span>
    );
}
