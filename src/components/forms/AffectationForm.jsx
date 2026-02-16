'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormSelect from '@/components/forms/FormSelect';
import UserAvatar from '@/components/layout/UserAvatar';

export default function AffectationForm({
    cours = null,
    professeursOptions = [],
    serverErrors = {},
    onSubmit,
    onCancel,
    loading = false,
}) {
    const [professeur_id, setProfesseurId] = useState('');
    const [error, setError] = useState('');

    const flattenServerErrors = (serverErrs) => {
        const flat = {};
        Object.entries(serverErrs).forEach(([key, messages]) => {
            const shortKey = key.includes('.') ? key.split('.').pop() : key;
            flat[shortKey] = Array.isArray(messages) ? messages[0] : messages;
        });
        return flat;
    };

    const allErrors = { 
        ...{ professeur_id: error }, 
        ...flattenServerErrors(serverErrors) 
    };

    // Pré-sélectionner le prof actuel s'il y en a un
    useEffect(() => {
        if (!cours) return;
        const profActuel = cours.professeurs?.[0];
        if (profActuel?.id) {
            setProfesseurId(String(profActuel.id));
        }
    }, [cours]);

    const profSelectionne = professeursOptions.find(
        p => String(p.value) === String(professeur_id)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation stricte
        if (!professeur_id || professeur_id === '') {
            setError('Veuillez sélectionner un professeur');
            return;
        }

        const profId = Number(professeur_id);
        
        // Vérifier que l'ID est un nombre valide
        if (isNaN(profId) || profId <= 0) {
            setError('ID professeur invalide');
            return;
        }

        // L'API attend { professeur_ids: [id] }
        onSubmit?.({ professeur_ids: [profId] });
    };

    const handleProfChange = (value) => {
        setProfesseurId(value);
        setError(''); // Réinitialiser l'erreur
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Info cours concerné */}
            {cours && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 sm:px-4 py-3">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
                        Cours concerné
                    </p>
                    <p className="font-bold text-sm text-gray-800 wrap-break-word">
                        {cours.titre}
                    </p>
                    <p className="text-[11px] text-gray-400">
                        {cours.code} — {cours.niveau?.nom || ''}
                    </p>
                </div>
            )}

            {/* Professeur actuel */}
            {cours?.professeurs?.length > 0 && (
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-medium">
                        Professeur actuel
                    </p>
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                        <UserAvatar 
                            name={cours.professeurs[0].nom_complet} 
                            variant="blue" 
                            size="sm" 
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-700 truncate">
                                {cours.professeurs[0].nom_complet}
                            </p>
                            {cours.professeurs[0].specialite && (
                                <p className="text-[10px] text-gray-400 truncate">
                                    {cours.professeurs[0].specialite}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sélection nouveau professeur */}
            <div className="space-y-3">
                <FormSelect
                    id="professeur_id"
                    label={
                        cours?.professeurs?.length > 0 
                            ? 'Nouveau professeur' 
                            : 'Assigner un professeur'
                    }
                    value={professeur_id}
                    onValueChange={handleProfChange}
                    options={professeursOptions}
                    placeholder="Choisir un professeur"
                    error={allErrors.professeur_id || allErrors.professeur_ids}
                    disabled={loading}
                    required
                />

                {/* Aperçu du prof sélectionné */}
                {profSelectionne && (
                    <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
                        <UserAvatar 
                            name={profSelectionne.label} 
                            variant="blue" 
                            size="sm" 
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-blue-800 truncate">
                                {profSelectionne.label}
                            </p>
                            {profSelectionne.specialite && (
                                <p className="text-[10px] text-blue-500 truncate">
                                    {profSelectionne.specialite}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions - Responsive */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel} 
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    Annuler
                </Button>
                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full sm:w-auto sm:min-w-30"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Affectation...
                        </>
                    ) : 'Affecter'}
                </Button>
            </div>
        </form>
    );
}