'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Info } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import UserAvatar from '@/components/layout/UserAvatar';

export default function CoursForm({
    serverErrors = {},
    cours = null,
    niveauxOptions = [],
    semestresOptions = [],
    professeursOptions = [],
    semestreActif = null,
    onSubmit,
    onCancel,
    loading = false,
    hideCancel = false,
}) {
    const isEditMode = !!cours;

    const [formData, setFormData] = useState({
        titre: '',
        code: '',
        description: '',
        coefficient: '1',
        nombre_heures: '',
        niveau_id: '',
        semestre_id: '',
        professeur_id: '',
    });

    const [errors, setErrors] = useState({});
    const [showProfSelector, setShowProfSelector] = useState(false);

    const flattenServerErrors = (serverErrs) => {
        const flat = {};
        Object.entries(serverErrs).forEach(([key, messages]) => {
            const shortKey = key.includes('.') ? key.split('.').pop() : key;
            flat[shortKey] = Array.isArray(messages) ? messages[0] : messages;
        });
        return flat;
    };

    const allErrors = { ...errors, ...flattenServerErrors(serverErrors) };

    // Pré-remplissage en mode édition
    useEffect(() => {
        if (!cours) return;
        const profAssigne = cours.professeurs?.[0];
        setFormData({
            titre:         cours.titre          || '',
            code:          cours.code           || '',
            description:   cours.description    || '',
            coefficient:   cours.coefficient    ? String(cours.coefficient) : '1',
            nombre_heures: cours.nombre_heures  ? String(cours.nombre_heures) : '',
            niveau_id:     cours.niveau?.id     ? String(cours.niveau.id) : '',
            semestre_id:   cours.semestre?.id   ? String(cours.semestre.id) : '',
            professeur_id: profAssigne?.id      ? String(profAssigne.id) : '',
        });
    }, [cours]);

    const validate = () => {
        const e = {};
        if (!formData.titre.trim())      e.titre       = 'Le titre est requis';
        if (!formData.code.trim())       e.code        = 'Le code est requis';
        if (!formData.niveau_id)         e.niveau_id   = 'Le niveau est requis';
        if (!formData.semestre_id)       e.semestre_id = 'Le semestre est requis';
        if (!formData.coefficient)       e.coefficient = 'Le coefficient est requis';
        else if (
            isNaN(Number(formData.coefficient)) ||
            Number(formData.coefficient) < 0.5  ||
            Number(formData.coefficient) > 10
        ) e.coefficient = 'Entre 0.5 et 10';
        
        // Vérification correcte de l'année académique (annee_academique.id et non annee_academique_id)
        if (!semestreActif?.annee_academique?.id) {
            e.semestre_id = 'Le semestre actif doit avoir une année académique associée';
        }
        
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (allErrors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            titre:               formData.titre.trim(),
            code:                formData.code.trim().toUpperCase(),
            description:         formData.description.trim() || null,
            coefficient:         Number(formData.coefficient),
            nombre_heures:       formData.nombre_heures ? Number(formData.nombre_heures) : null,
            niveau_id:           Number(formData.niveau_id),
            semestre_id:         Number(formData.semestre_id),
            annee_academique_id: Number(semestreActif.annee_academique.id), 
        };

        if (formData.professeur_id) {
            payload.professeur_ids = [Number(formData.professeur_id)];
        }

        onSubmit?.(payload);
    };

    const profSelectionne = professeursOptions.find(
        p => String(p.value) === String(formData.professeur_id)
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-0">
            {/* Layout responsive avec flex-col sur mobile, flex-row sur desktop */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── Colonne gauche ── */}
                <div className="flex-1 space-y-4">

                    {/* Titre + Code - responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                            id="titre"
                            label="Titre du Cours"
                            value={formData.titre}
                            onChange={e => handleChange('titre', e.target.value)}
                            error={allErrors.titre}
                            disabled={loading}
                            required
                            placeholder="Ex: Algorithmique Avancée"
                        />
                        <FormInput
                            id="code"
                            label="Code du Cours"
                            value={formData.code}
                            onChange={e => handleChange('code', e.target.value.toUpperCase())}
                            error={allErrors.code}
                            disabled={loading}
                            required
                            placeholder="Ex: INFO-304"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={e => handleChange('description', e.target.value)}
                            disabled={loading}
                            placeholder="Objectifs et résumé du contenu pédagogique..."
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
                        />
                    </div>

                    {/* Niveau + Semestre + Coefficient - responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormSelect
                            id="niveau_id"
                            label="Niveau"
                            value={formData.niveau_id}
                            onValueChange={v => handleChange('niveau_id', v)}
                            options={niveauxOptions}
                            placeholder="Choisir"
                            error={allErrors.niveau_id}
                            disabled={loading}
                            required
                        />
                        <FormSelect
                            id="semestre_id"
                            label="Semestre"
                            value={formData.semestre_id}
                            onValueChange={v => handleChange('semestre_id', v)}
                            options={semestresOptions}
                            placeholder="Choisir"
                            error={allErrors.semestre_id}
                            disabled={loading}
                            required
                        />
                        <FormInput
                            id="coefficient"
                            label="Coefficient"
                            type="number"
                            min={0.5}
                            max={10}
                            step={0.5}
                            value={formData.coefficient}
                            onChange={e => handleChange('coefficient', e.target.value)}
                            error={allErrors.coefficient}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Nombre d'heures */}
                    <FormInput
                        id="nombre_heures"
                        label="Nombre d'heures (optionnel)"
                        type="number"
                        min={1}
                        value={formData.nombre_heures}
                        onChange={e => handleChange('nombre_heures', e.target.value)}
                        error={allErrors.nombre_heures}
                        disabled={loading}
                        placeholder="Ex: 45"
                    />
                </div>

                {/* ── Colonne droite — Professeur assigné ── */}
                {/* Pleine largeur sur mobile, colonne sur desktop */}
                <div className="w-full lg:w-56 lg:shrink-0 space-y-3">
                    <p className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                        Professeur Assigné
                    </p>

                    {/* Carte prof sélectionné */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        {profSelectionne ? (
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <UserAvatar name={profSelectionne.label} variant="blue" size="sm" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {profSelectionne.label}
                                        </p>
                                        {profSelectionne.specialite && (
                                            <p className="text-[11px] text-gray-400 truncate">
                                                {profSelectionne.specialite}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowProfSelector(!showProfSelector)}
                                    className="text-gray-400 hover:text-blue-500 transition-colors shrink-0 mt-0.5"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowProfSelector(!showProfSelector)}
                                className="w-full text-center text-sm text-gray-400 hover:text-blue-500 py-2 transition-colors"
                            >
                                + Assigner un professeur
                            </button>
                        )}

                        {/* Selector inline */}
                        {showProfSelector && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <FormSelect
                                    id="professeur_id"
                                    value={formData.professeur_id}
                                    onValueChange={v => {
                                        handleChange('professeur_id', v);
                                        setShowProfSelector(false);
                                    }}
                                    options={[
                                        { value: '', label: 'Aucun professeur' },
                                        ...professeursOptions,
                                    ]}
                                    placeholder="Choisir un professeur"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {profSelectionne && !showProfSelector && (
                            <p className="mt-1.5 text-[10px] text-gray-400">
                                Cliquez sur pour changer le professeur responsable.
                            </p>
                        )}
                    </div>

                    {/* Rappel salle */}
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 flex gap-2">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-600 leading-tight">
                            <span className="font-semibold">Rappel</span><br />
                            L'assignation d'une salle se fera lors de la création de l'emploi du temps.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            {/* Boutons responsive : empilés sur mobile, alignés sur desktop */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-gray-100 mt-5">
                {!hideCancel && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel} 
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Annuler
                    </Button>
                )}
                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full sm:w-auto sm:min-w-30"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? 'Modification...' : 'Enregistrement...'}
                        </>
                    ) : isEditMode ? 'Modifier' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}