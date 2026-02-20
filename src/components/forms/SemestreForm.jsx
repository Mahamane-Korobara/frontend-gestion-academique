'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import FormInput    from '@/components/forms/FormInput';
import FormSelect   from '@/components/forms/FormSelect';
import FormCheckbox from '@/components/forms/FormCheckbox';

const SEMESTRE_OPTIONS = [
    { value: 'S1', label: 'Semestre 1' },
    { value: 'S2', label: 'Semestre 2' },
];

/**
 * Formulaire création / édition d'un semestre
 * Props :
 *  - semestre       : objet existant (édition) ou null (création)
 *  - anneesOptions  : [{ value, label }]
 *  - anneeIdFixed   : pré-sélectionner et verrouiller une année (ex: depuis l'accordéon)
 *  - onSubmit       : (data) => Promise
 *  - onCancel       : () => void
 *  - loading        : boolean
 *  - serverErrors   : objet d'erreurs backend
 */
export default function SemestreForm({
    semestre      = null,
    anneesOptions = [],
    anneeIdFixed  = null,
    onSubmit,
    onCancel,
    loading       = false,
    serverErrors  = {},
}) {
    const isEdit = !!semestre;

    const [form, setForm] = useState({
        annee_academique_id:  anneeIdFixed ?? semestre?.annee_academique?.id ?? '',
        numero:               semestre?.numero ?? '',
        date_debut:           semestre?.date_debut ?? '',
        date_fin:             semestre?.date_fin   ?? '',
        date_debut_examens:   semestre?.date_debut_examens ?? '',
        date_fin_examens:     semestre?.date_fin_examens   ?? '',
        is_active:            semestre?.is_active ?? false,
    });
    const [errors, setErrors] = useState({});

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
        if (!form.annee_academique_id) e.annee_academique_id = 'L\'année académique est requise';
        if (!form.numero)              e.numero              = 'Le semestre est requis';
        if (!form.date_debut)          e.date_debut          = 'La date de début est requise';
        if (!form.date_fin)            e.date_fin            = 'La date de fin est requise';
        if (!form.date_debut_examens)  e.date_debut_examens  = 'La date de début des examens est requise';
        if (!form.date_fin_examens)    e.date_fin_examens    = 'La date de fin des examens est requise';

        if (form.date_debut && form.date_fin && form.date_debut >= form.date_fin)
            e.date_fin = 'La date de fin doit être après la date de début';

        if (form.date_debut_examens && form.date_fin_examens
            && form.date_debut_examens > form.date_fin_examens)
            e.date_fin_examens = 'La date de fin des examens doit être après la date de début';

        if (form.date_debut_examens && form.date_debut && form.date_fin) {
            if (form.date_debut_examens < form.date_debut || form.date_debut_examens > form.date_fin)
                e.date_debut_examens = 'Les examens doivent être dans la période du semestre';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit?.({
            ...form,
            annee_academique_id: Number(form.annee_academique_id),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Année académique */}
            <FormSelect
                id="annee_academique_id" label="Année académique"
                value={String(form.annee_academique_id)}
                onValueChange={v => set('annee_academique_id', v)}
                options={anneesOptions}
                placeholder="Choisir une année"
                error={errors.annee_academique_id}
                disabled={loading || !!anneeIdFixed || isEdit}
                required
            />

            {/* Numéro semestre */}
            <FormSelect
                id="numero" label="Semestre"
                value={form.numero}
                onValueChange={v => set('numero', v)}
                options={SEMESTRE_OPTIONS}
                placeholder="S1 ou S2"
                error={errors.numero}
                disabled={loading || isEdit}
                required
            />

            {/* Période du semestre */}
            <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Période du semestre</p>
                <div className="grid grid-cols-2 gap-3">
                    <FormInput
                        id="date_debut" label="Début"
                        type="date" value={form.date_debut}
                        onChange={e => set('date_debut', e.target.value)}
                        error={errors.date_debut} disabled={loading} required
                    />
                    <FormInput
                        id="date_fin" label="Fin"
                        type="date" value={form.date_fin}
                        onChange={e => set('date_fin', e.target.value)}
                        error={errors.date_fin} disabled={loading} required
                    />
                </div>
            </div>

            {/* Période des examens */}
            <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Période des examens</p>
                <div className="grid grid-cols-2 gap-3">
                    <FormInput
                        id="date_debut_examens" label="Début examens"
                        type="date" value={form.date_debut_examens}
                        onChange={e => set('date_debut_examens', e.target.value)}
                        error={errors.date_debut_examens} disabled={loading} required
                    />
                    <FormInput
                        id="date_fin_examens" label="Fin examens"
                        type="date" value={form.date_fin_examens}
                        onChange={e => set('date_fin_examens', e.target.value)}
                        error={errors.date_fin_examens} disabled={loading} required
                    />
                </div>
            </div>

            <FormCheckbox
                id="is_active" label="Activer ce semestre immédiatement"
                checked={form.is_active}
                onCheckedChange={v => set('is_active', v)}
                disabled={loading}
            />

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Modification...' : 'Création...'}</>
                        : isEdit ? 'Modifier' : 'Créer le semestre'
                    }
                </Button>
            </div>
        </form>
    );
}