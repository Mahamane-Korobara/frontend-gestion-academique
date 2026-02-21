import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { ALERT_ICONS } from '@/lib/utils/constants';

export default function AlertModalContent({ alert, onClose, onNavigate }) {
    const Icon = ALERT_ICONS[alert.key] ?? ALERT_ICONS.default;

    return (
        <div className="space-y-4">
            {/* Description */}
            <p className="text-sm text-gray-600">{alert.modalDescription ?? alert.message}</p>

            {/* Liste des items concernés (si fournis) */}
            {alert.items && alert.items.length > 0 && (
                <div className="rounded-lg border border-gray-100 divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {alert.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors">
                            <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                                {item.sublabel && (
                                    <p className="text-xs text-gray-400 truncate">{item.sublabel}</p>
                                )}
                            </div>
                            {/* Action par item si fournie */}
                            {item.action && (
                                <button
                                    onClick={() => { onNavigate(item.action); onClose(); }}
                                    className="shrink-0 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium"
                                >
                                    Agir <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Bouton d'action globale */}
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={onClose}>
                    Fermer
                </Button>
                {alert.action && (
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => { onNavigate(alert.action); onClose(); }}
                    >
                        {alert.actionLabel ?? 'Accéder'} <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}