'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button }     from '@/components/ui/button';
import FormSelect     from '@/components/forms/FormSelect';
import InfoField      from '@/components/partage/InfoField';

export default function InscriptionNiveauModal({
    isOpen,
    onClose,
    etudiant,
    filieresOptions    = [],
    getNiveauxByFiliere,
    onSubmit,
    isSubmitting       = false,
}) {
    const [filiereId, setFiliereId]           = useState('');
    const [niveauId, setNiveauId]             = useState('');
    const [niveauxOptions, setNiveauxOptions] = useState([]);
    const [errors, setErrors]                 = useState({});

    useEffect(() => {
        if (!isOpen) {
            setFiliereId('');
            setNiveauId('');
            setNiveauxOptions([]);
            setErrors({});
        }
    }, [isOpen]);

    const handleFiliereChange = useCallback((value) => {
        setFiliereId(value);
        setNiveauId('');
        setErrors(p => ({ ...p, filiere_id: undefined, niveau_id: undefined }));
        setNiveauxOptions(value && getNiveauxByFiliere ? (getNiveauxByFiliere(value) ?? []) : []);
    }, [getNiveauxByFiliere]);

    const handleNiveauChange = (value) => {
        setNiveauId(value);
        setErrors(p => ({ ...p, niveau_id: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!filiereId) e.filiere_id = 'La filière est requise';
        if (!niveauId)  e.niveau_id  = 'Le niveau est requis';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        const etudiantModelId = etudiant?.profile?.id ?? etudiant?.id;
        const result = await onSubmit?.(etudiantModelId, {
            filiere_id: Number(filiereId),
            niveau_id:  Number(niveauId),
        });
        if (result?.success) onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="backdrop-blur-sm" />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Inscrire à un niveau</DialogTitle>
                    <DialogDescription>
                        Tous les cours actifs du niveau choisi seront assignés automatiquement
                        pour le semestre en cours.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <InfoField icon={GraduationCap} label="Étudiant" value={etudiant?.name ?? '—'} />

                    <FormSelect
                        id="filiere_id" label="Filière"
                        value={filiereId}
                        onValueChange={handleFiliereChange}
                        options={filieresOptions}
                        placeholder="Choisir une filière"
                        error={errors.filiere_id}
                        disabled={isSubmitting} required
                    />

                    {filiereId && (
                        niveauxOptions.length === 0 ? (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                Aucun niveau disponible pour cette filière.
                            </p>
                        ) : (
                            <FormSelect
                                id="niveau_id" label="Niveau"
                                value={niveauId}
                                onValueChange={handleNiveauChange}
                                options={niveauxOptions}
                                placeholder="Choisir un niveau"
                                error={errors.niveau_id}
                                disabled={isSubmitting} required
                            />
                        )
                    )}

                    {niveauId && (
                        <p className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            L'étudiant sera inscrit à tous les cours de ce niveau pour l'année et le semestre actifs.
                        </p>
                    )}

                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !filiereId || !niveauId}>
                            {isSubmitting
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscription...</>
                                : "Inscrire l'étudiant"
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}