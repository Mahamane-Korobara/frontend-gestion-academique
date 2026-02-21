'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Info } from 'lucide-react';
import { Button }     from '@/components/ui/button';
import FormInput      from '@/components/forms/FormInput';
import FormSelect     from '@/components/forms/FormSelect';
import FormTextarea   from '@/components/forms/FormTextarea';
import { TYPES_EVALUATIONS, STATUT_OPTIONS } from '@/lib/utils/constants';

/**
 * EvaluationForm
 *
 * Auto-remplissage :
 *  1. Choix du type  → coefficient = coefficient_defaut (modifiable par l'admin)
 *  2. Choix du cours → semestre_id auto + titre généré si vide
 *  3. Choix du cours + type → titre régénéré
 *
 * Props :
 *  - evaluation      : objet existant (édition) | null (création)
 *  - coursOptions    : [{ value, label, semestre_id }]
 *  - semestresOptions: [{ value, label }]
 *  - onSubmit        : (coursId, data) => Promise
 *  - onCancel        : () => void
 *  - loading         : boolean
 *  - serverErrors    : {}
 */
export default function EvaluationForm({
    evaluation       = null,
    coursOptions     = [],
    semestresOptions = [],
    onSubmit,
    onCancel,
    loading          = false,
    serverErrors     = {},
}) {
    const isEdit = !!evaluation;

    const [form, setForm] = useState({
        cours_id:           evaluation?.cours?.id           ? String(evaluation.cours.id)           : '',
        type_evaluation_id: evaluation?.type_evaluation?.id ? String(evaluation.type_evaluation.id) : '',
        semestre_id:        evaluation?.semestre?.id        ? String(evaluation.semestre.id)        : '',
        titre:              evaluation?.titre               ?? '',
        coefficient:        evaluation?.coefficient         ?? '',
        date_evaluation:    evaluation?.date_evaluation?.split('T')[0] ?? '',
        heure_debut:        evaluation?.heure_debut ? evaluation.heure_debut.substring(11, 16) : '',
        heure_fin:          evaluation?.heure_fin   ? evaluation.heure_fin.substring(11, 16)   : '',
        instructions:       evaluation?.instructions ?? '',
        statut:             evaluation?.statut        ?? 'planifiee',
    });

    // Indique si le coef a été modifié manuellement (pour ne pas écraser la saisie admin)
    const [coefTouched, setCoefTouched] = useState(isEdit);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0)
            setErrors(p => ({ ...p, ...serverErrors }));
    }, [serverErrors]);

    const set = (key, value) => {
        setForm(p => ({ ...p, [key]: value }));
        setErrors(p => ({ ...p, [key]: undefined }));
    };

    // Titre auto : "Type - Cours"
    const buildTitre = (typeId, coursId) => {
        const typeLabel  = TYPES_EVALUATIONS.find(t => t.value === typeId)?.label ?? '';
        const coursLabel = coursOptions.find(c => String(c.value) === String(coursId))?.label ?? '';
        if (!typeLabel || !coursLabel) return '';
        // Label cours est "CODE — Titre", on prend juste le titre
        const coursShort = coursLabel.includes('—') ? coursLabel.split('—')[1]?.trim() : coursLabel;
        return `${typeLabel} - ${coursShort}`;
    };

    //  Sélection du type 
    const handleTypeChange = useCallback((typeId) => {
        set('type_evaluation_id', typeId);

        // Auto-remplissage coefficient (seulement si pas encore touché manuellement)
        if (!coefTouched) {
            const type = TYPES_EVALUATIONS.find(t => t.value === typeId);
            if (type) set('coefficient', type.coefficient_defaut);
        }

        // Titre auto
        const titre = buildTitre(typeId, form.cours_id);
        if (titre) set('titre', titre);
    }, [coefTouched, form.cours_id, coursOptions]);

    //  Sélection du cours 
    const handleCoursChange = useCallback((coursId) => {
        set('cours_id', coursId);
        const cours = coursOptions.find(c => String(c.value) === String(coursId));

        // Auto-remplissage semestre
        if (cours?.semestre_id) set('semestre_id', String(cours.semestre_id));

        // Titre auto
        const titre = buildTitre(form.type_evaluation_id, coursId);
        if (titre) set('titre', titre);
    }, [form.type_evaluation_id, coursOptions]);

    //  Coefficient modifié manuellement 
    const handleCoefChange = (e) => {
        setCoefTouched(true);
        set('coefficient', e.target.value);
    };

    //  Validation
    const validate = () => {
        const e = {};
        if (!form.cours_id)           e.cours_id           = 'Le cours est requis';
        if (!form.type_evaluation_id) e.type_evaluation_id = 'Le type est requis';
        if (!form.semestre_id)        e.semestre_id        = 'Le semestre est requis';
        if (!form.titre.trim())       e.titre              = 'Le titre est requis';
        if (!form.coefficient)        e.coefficient        = 'Le coefficient est requis';
        if (!form.date_evaluation)    e.date_evaluation    = 'La date est requise';
        if (form.heure_debut && form.heure_fin && form.heure_debut >= form.heure_fin)
            e.heure_fin = 'L\'heure de fin doit être après l\'heure de début';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const { cours_id, ...rest } = form;
        await onSubmit?.(Number(cours_id), {
            ...rest,
            type_evaluation_id: Number(form.type_evaluation_id),
            semestre_id:        Number(form.semestre_id),
            coefficient:        Number(form.coefficient),
            heure_debut:        form.heure_debut || null,
            heure_fin:          form.heure_fin   || null,
        });
    };

    // Hint coefficient : montre le défaut pour le type sélectionné
    const selectedType = TYPES_EVALUATIONS.find(t => t.value === form.type_evaluation_id);
    const coefHint = selectedType && !coefTouched
        ? `Valeur par défaut pour ${selectedType.label} : ${selectedType.coefficient_defaut}`
        : selectedType
            ? `Défaut ${selectedType.label} : ${selectedType.coefficient_defaut} — modifié manuellement`
            : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Cours + Type */}
            <div className="grid grid-cols-2 gap-3">
                <FormSelect
                    id="cours_id" label="Cours"
                    value={form.cours_id}
                    onValueChange={handleCoursChange}
                    options={coursOptions}
                    placeholder="Choisir un cours"
                    error={errors.cours_id}
                    disabled={loading || isEdit}
                    required
                />
                <FormSelect
                    id="type_evaluation_id" label="Type d'évaluation"
                    value={form.type_evaluation_id}
                    onValueChange={handleTypeChange}
                    options={TYPES_EVALUATIONS}
                    placeholder="Choisir un type"
                    error={errors.type_evaluation_id}
                    disabled={loading}
                    required
                />
            </div>

            {/* Semestre — auto-rempli */}
            <FormSelect
                id="semestre_id" label="Semestre"
                value={form.semestre_id}
                onValueChange={v => set('semestre_id', v)}
                options={semestresOptions}
                placeholder="Choisir un semestre"
                error={errors.semestre_id}
                disabled={loading}
                required
            />

            {/* Titre — auto-généré, modifiable */}
            <FormInput
                id="titre" label="Titre"
                placeholder="ex: Contrôle Continu - Algorithmique"
                value={form.titre}
                onChange={e => set('titre', e.target.value)}
                error={errors.titre}
                disabled={loading}
                required
            />

            {/* Coefficient + Date */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <FormInput
                        id="coefficient" label="Coefficient"
                        type="number" step="0.01" min="0.01" max="10"
                        placeholder="ex: 0.40"
                        value={form.coefficient}
                        onChange={handleCoefChange}
                        error={errors.coefficient}
                        disabled={loading}
                        required
                    />
                    {/* Hint discret sous le champ */}
                    {coefHint && (
                        <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                            <Info className="w-3 h-3 shrink-0" />
                            {coefHint}
                        </p>
                    )}
                </div>
                <FormInput
                    id="date_evaluation" label="Date de l'évaluation"
                    type="date"
                    value={form.date_evaluation}
                    onChange={e => set('date_evaluation', e.target.value)}
                    error={errors.date_evaluation}
                    disabled={loading}
                    required
                />
            </div>

            {/* Horaires */}
            <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Horaires <span className="normal-case font-normal text-gray-400">(optionnel)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <FormInput
                        id="heure_debut" label="Heure début"
                        type="time" value={form.heure_debut}
                        onChange={e => set('heure_debut', e.target.value)}
                        error={errors.heure_debut} disabled={loading}
                    />
                    <FormInput
                        id="heure_fin" label="Heure fin"
                        type="time" value={form.heure_fin}
                        onChange={e => set('heure_fin', e.target.value)}
                        error={errors.heure_fin} disabled={loading}
                    />
                </div>
            </div>

            {/* Statut — édition uniquement */}
            {isEdit && (
                <FormSelect
                    id="statut" label="Statut"
                    value={form.statut}
                    onValueChange={v => set('statut', v)}
                    options={STATUT_OPTIONS}
                    disabled={loading}
                />
            )}

            {/* Instructions */}
            <FormTextarea
                id="instructions" label="Instructions"
                placeholder="Calculatrices non autorisées. Justifier tous les raisonnements."
                value={form.instructions}
                onChange={e => set('instructions', e.target.value)}
                disabled={loading}
                rows={3}
            />

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Modification...' : 'Création...'}</>
                        : isEdit ? 'Modifier' : 'Créer l\'évaluation'
                    }
                </Button>
            </div>
        </form>
    );
}