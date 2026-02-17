'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import FormInput  from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { emploiDuTempsAdminAPI } from '@/lib/api/endpoints';

// ✅ Valeurs exactes de l'enum JourSemaine PHP (majuscule)
const JOURS = [
    { value: 'Lundi',    label: 'Lundi'    },
    { value: 'Mardi',    label: 'Mardi'    },
    { value: 'Mercredi', label: 'Mercredi' },
    { value: 'Jeudi',    label: 'Jeudi'    },
    { value: 'Vendredi', label: 'Vendredi' },
    { value: 'Samedi',   label: 'Samedi'   },
];

// ✅ Valeurs exactes de l'enum TypeSeance PHP (minuscule)
const TYPES_SEANCE = [
    { value: 'cours',   label: 'Cours magistral'   },
    { value: 'td',      label: 'Travaux Dirigés'   },
    { value: 'tp',      label: 'Travaux Pratiques' },
    { value: 'examen',  label: 'Examen'            },
];

const flattenServerErrors = (errs = {}) => {
    const flat = {};
    Object.entries(errs).forEach(([key, msgs]) => {
        const k = key.includes('.') ? key.split('.').pop() : key;
        flat[k] = Array.isArray(msgs) ? msgs[0] : msgs;
    });
    return flat;
};

export default function CreneauForm({
    serverErrors   = {},
    niveauxOptions    = [],
    semestresOptions  = [],
    professeursOptions = [],
    semestreActif  = null,
    onSubmit,
    loading        = false,
}) {
    const [formData, setFormData] = useState({
        niveau_id:     '',
        semestre_id:   semestreActif ? String(semestreActif.id) : '',
        professeur_id: '',
        cours_id:      '',
        jour:          '',
        heure_debut:   '',
        heure_fin:     '',
        type_seance:   'cours',
    });

    const [errors, setErrors]         = useState({});
    const [coursOptions, setCoursOptions] = useState([]);
    const [loadingCours, setLoadingCours] = useState(false);
    const [coursError, setCoursError]   = useState(null);

    const allErrors = { ...errors, ...flattenServerErrors(serverErrors) };

    // Pré-sélectionner le semestre actif au montage
    useEffect(() => {
        if (semestreActif?.id && !formData.semestre_id) {
            setFormData(p => ({ ...p, semestre_id: String(semestreActif.id) }));
        }
    }, [semestreActif]);

    // Charger les cours disponibles quand niveau + semestre + prof sont sélectionnés
    useEffect(() => {
        if (!formData.professeur_id || !formData.niveau_id || !formData.semestre_id) {
            setCoursOptions([]);
            setFormData(p => ({ ...p, cours_id: '' }));
            return;
        }
        let cancelled = false;
        setLoadingCours(true);
        setCoursError(null);
        emploiDuTempsAdminAPI.getCoursDisponibles({
            professeur_id: formData.professeur_id,
            niveau_id:     formData.niveau_id,
            semestre_id:   formData.semestre_id,
        })
        .then(res => {
            if (!cancelled) {
                const liste = res?.cours || res?.data || [];
                setCoursOptions(
                    liste.map(c => ({
                        value: String(c.id),
                        label: `${c.titre} (${c.code})`,
                    }))
                );
            }
        })
        .catch(err => {
            if (!cancelled) setCoursError('Impossible de charger les cours');
        })
        .finally(() => { if (!cancelled) setLoadingCours(false); });
        return () => { cancelled = true; };
    }, [formData.professeur_id, formData.niveau_id, formData.semestre_id]);

    const handleChange = (field, value) => {
        setFormData(p => ({ ...p, [field]: value }));
        if (allErrors[field]) setErrors(p => ({ ...p, [field]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!formData.niveau_id)     e.niveau_id     = 'Le niveau est requis';
        if (!formData.semestre_id)   e.semestre_id   = 'Le semestre est requis';
        if (!formData.professeur_id) e.professeur_id = 'Le professeur est requis';
        if (!formData.cours_id)      e.cours_id      = 'Le cours est requis';
        if (!formData.jour)          e.jour          = 'Le jour est requis';
        if (!formData.heure_debut)   e.heure_debut   = "L'heure de début est requise";
        if (!formData.heure_fin)     e.heure_fin     = "L'heure de fin est requise";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit?.({
            niveau_id:     Number(formData.niveau_id),
            semestre_id:   Number(formData.semestre_id),
            cours_id:      Number(formData.cours_id),
            professeur_id: Number(formData.professeur_id),
            jour:          formData.jour,          // ✅ "Lundi", "Mardi"...
            heure_debut:   formData.heure_debut,   // ✅ "HH:mm"
            heure_fin:     formData.heure_fin,
            type_seance:   formData.type_seance,   // ✅ "cours", "td", "tp", "examen"
            // salle_id omis (optionnel backend)
        });
    };

    const coursPlaceholder = () => {
        if (!formData.professeur_id || !formData.niveau_id || !formData.semestre_id)
            return 'Sélectionnez niveau, semestre et prof d\'abord';
        if (loadingCours) return 'Chargement...';
        if (coursOptions.length === 0) return 'Aucun cours disponible pour cette sélection';
        return 'Choisir un cours';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Section Contexte ── */}
            <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Contexte
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormSelect
                        id="niveau_id" label="Niveau"
                        value={formData.niveau_id}
                        onValueChange={v => { handleChange('niveau_id', v); handleChange('cours_id', ''); }}
                        options={niveauxOptions}
                        placeholder="Choisir un niveau"
                        error={allErrors.niveau_id}
                        disabled={loading} required
                    />
                    <FormSelect
                        id="semestre_id" label="Semestre"
                        value={formData.semestre_id}
                        onValueChange={v => { handleChange('semestre_id', v); handleChange('cours_id', ''); }}
                        options={semestresOptions}
                        placeholder="Choisir un semestre"
                        error={allErrors.semestre_id}
                        disabled={loading} required
                    />
                </div>
            </div>

            {/* ── Section Affectation ── */}
            <div className="space-y-3 border-t border-gray-100 pt-5">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Affectation
                </p>
                <FormSelect
                    id="professeur_id" label="Professeur"
                    value={formData.professeur_id}
                    onValueChange={v => { handleChange('professeur_id', v); handleChange('cours_id', ''); }}
                    options={professeursOptions}
                    placeholder="Choisir un professeur"
                    error={allErrors.professeur_id}
                    disabled={loading} required
                />
                <div className="space-y-1">
                    <FormSelect
                        id="cours_id" label="Cours"
                        value={formData.cours_id}
                        onValueChange={v => handleChange('cours_id', v)}
                        options={coursOptions}
                        placeholder={coursPlaceholder()}
                        error={allErrors.cours_id}
                        disabled={loading || loadingCours || coursOptions.length === 0}
                        required
                    />
                    {coursError && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="w-3 h-3" /> {coursError}
                        </p>
                    )}
                    {!loadingCours && coursOptions.length === 0 && formData.professeur_id && formData.niveau_id && formData.semestre_id && !coursError && (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1.5">
                            Aucun cours : ce professeur n'enseigne peut-être pas encore de cours pour ce niveau/semestre.
                        </p>
                    )}
                </div>
            </div>

            {/* ── Section Horaire ── */}
            <div className="space-y-3 border-t border-gray-100 pt-5">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Horaire
                </p>
                <div className="grid grid-cols-3 gap-3">
                    <FormSelect
                        id="jour" label="Jour"
                        value={formData.jour}
                        onValueChange={v => handleChange('jour', v)}
                        options={JOURS}
                        placeholder="Jour"
                        error={allErrors.jour}
                        disabled={loading} required
                    />
                    <FormInput
                        id="heure_debut" label="Début"
                        type="time" min="08:00" max="20:00"
                        value={formData.heure_debut}
                        onChange={e => handleChange('heure_debut', e.target.value)}
                        error={allErrors.heure_debut}
                        disabled={loading} required
                    />
                    <FormInput
                        id="heure_fin" label="Fin"
                        type="time" min="08:00" max="20:00"
                        value={formData.heure_fin}
                        onChange={e => handleChange('heure_fin', e.target.value)}
                        error={allErrors.heure_fin}
                        disabled={loading} required
                    />
                </div>
                <FormSelect
                    id="type_seance" label="Type de séance"
                    value={formData.type_seance}
                    onValueChange={v => handleChange('type_seance', v)}
                    options={TYPES_SEANCE}
                    error={allErrors.type_seance}
                    disabled={loading}
                />
            </div>

            {/* ── Action ── */}
            <div className="pt-2 border-t border-gray-100">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création du créneau...</>
                    ) : 'Créer le créneau'}
                </Button>
            </div>
        </form>
    );
}