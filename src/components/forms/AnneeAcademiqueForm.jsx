'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button }    from '@/components/ui/button';
import FormInput     from '@/components/forms/FormInput';
import FormCheckbox  from '@/components/forms/FormCheckbox';

/**
 * Formulaire création / édition d'une année académique
 * Props :
 *  - annee        : objet existant (mode édition) ou null (mode création)
 *  - onSubmit     : (data) => Promise
 *  - onCancel     : () => void
 *  - loading      : boolean
 *  - serverErrors : objet d'erreurs du backend
 */
export default function AnneeAcademiqueForm({
    annee        = null,
    onSubmit,
    onCancel,
    loading      = false,
    serverErrors = {},
}) {
    const isEdit = !!annee;

    const [form, setForm] = useState({
        annee:       annee?.annee      ?? '',
        date_debut:  annee?.date_debut ?? '',
        date_fin:    annee?.date_fin   ?? '',
        is_active:   annee?.is_active  ?? false,
    });
    const [errors, setErrors] = useState({});

    // Fusionner les erreurs serveur
    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...serverErrors }));
        }
    }, [serverErrors]);

    const set = (key, value) => {
        setForm(p => ({ ...p, [key]: value }));
        setErrors(p => ({ ...p, [key]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.annee)       e.annee      = 'L\'année est requise (ex: 2025-2026)';
        if (!form.date_debut)  e.date_debut = 'La date de début est requise';
        if (!form.date_fin)    e.date_fin   = 'La date de fin est requise';
        if (form.date_debut && form.date_fin && form.date_debut >= form.date_fin) {
            e.date_fin = 'La date de fin doit être après la date de début';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit?.(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
                id="annee" label="Année académique"
                placeholder="ex: 2025-2026"
                value={form.annee}
                onChange={e => set('annee', e.target.value)}
                error={errors.annee}
                disabled={loading || isEdit}
                required
            />

            <div className="grid grid-cols-2 gap-3">
                <FormInput
                    id="date_debut" label="Date de début"
                    type="date"
                    value={form.date_debut}
                    onChange={e => set('date_debut', e.target.value)}
                    error={errors.date_debut}
                    disabled={loading}
                    required
                />
                <FormInput
                    id="date_fin" label="Date de fin"
                    type="date"
                    value={form.date_fin}
                    onChange={e => set('date_fin', e.target.value)}
                    error={errors.date_fin}
                    disabled={loading}
                    required
                />
            </div>

            {!isEdit && (
                <FormCheckbox
                    id="is_active"
                    label="Activer immédiatement cette année"
                    checked={form.is_active}
                    onCheckedChange={v => set('is_active', v)}
                    disabled={loading}
                />
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Modification...' : 'Création...'}</>
                        : isEdit ? 'Modifier' : 'Créer l\'année'
                    }
                </Button>
            </div>
        </form>
    );
}