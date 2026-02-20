import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ModalWrapper({ isOpen, onClose, title, description, children }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="backdrop-blur-sm" />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}