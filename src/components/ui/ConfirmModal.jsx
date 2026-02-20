import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ConfirmModal({
    isOpen, onClose, onConfirm, loading,
    title, message, confirmLabel = 'Confirmer', variant = 'default',
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="backdrop-blur-sm" />
            <DialogContent className="sm:max-w-sm">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="text-center py-2">
                    <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                        variant === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                        <AlertTriangle className={`w-6 h-6 ${
                            variant === 'warning' ? 'text-orange-500' : 'text-blue-600'
                        }`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="min-w-24"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={loading}
                            className="min-w-24"
                        >
                            {loading
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</>
                                : confirmLabel
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}