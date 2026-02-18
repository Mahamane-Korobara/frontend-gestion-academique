'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, User, GraduationCap, Layers, CalendarDays, Building2 } from 'lucide-react';
import FormInput  from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import InfoField  from '@/components/partage/InfoField';
import { coursAPI } from '@/lib/api/endpoints';
import { JOURS, TYPES_SEANCE } from '@/lib/utils/constants';

const flattenServerErrors = (errs = {}) => {
    const flat = {};
    Object.entries(errs).forEach(([key, msgs]) => {
        const k = key.includes('.') ? key.split('.').pop() : key;
        flat[k] = Array.isArray(msgs) ? msgs[0] : msgs;
    });
    return flat;
};

export default function CreneauForm({
    serverErrors  = {},
    anneeActive   = null,
    onSubmit,
    loading       = false,
}) {
    const [formData, setFormData] = useState({
        cours_id:      '',
        professeur_id: '',
        jour:          '',
        heure_debut:   '',
        heure_fin:     '',
        type_seance:   'cours',
    });

    const [errors, setErrors]             = useState({});
    const [allCours, setAllCours]         = useState([]);
    const [loadingCours, setLoadingCours] = useState(false);
    const [coursError, setCoursError]     = useState(null);
    const [coursInfo, setCoursInfo]       = useState(null);

    const allErrors = { ...errors, ...flattenServerErrors(serverErrors) };

    useEffect(() => {
        let cancelled = false;
        setLoadingCours(true);
        setCoursError(null);

        coursAPI.getAll({ is_active: 1 })
            .then(res => {
                if (!cancelled) setAllCours(res?.data || res || []);
            })
            .catch(() => {
                if (!cancelled) setCoursError('Impossible de charger la liste des cours.');
            })
            .finally(() => { if (!cancelled) setLoadingCours(false); });

        return () => { cancelled = true; };
    }, []);

    const coursOptions = allCours.map(c => ({
        value: String(c.id),
        label: `${c.titre} — ${c.niveau?.filiere ?? ''} ${c.niveau?.nom ?? ''} (${c.code})`,
    }));

    // Professeurs du cours sélectionné 
    const professeursDuCours = coursInfo?.professeurs ?? [];
    const professeursOptions = professeursDuCours.map(p => ({
        value: String(p.id),
        label: p.nom_complet,
    }));

    // uand un cours change : reset professeur et peupler les info
    const handleCoursChange = useCallback((value) => {
        const found = allCours.find(c => String(c.id) === value);
        setCoursInfo(found || null);

        // Pré-sélection auto si un seul professeur
        const autoProfId = found?.professeurs?.length === 1
            ? String(found.professeurs[0].id)
            : '';

        setFormData(p => ({ ...p, cours_id: value, professeur_id: autoProfId }));
        setErrors(p => ({ ...p, cours_id: undefined, professeur_id: undefined }));
    }, [allCours]);

    const handleChange = (field, value) => {
        setFormData(p => ({ ...p, [field]: value }));
        setErrors(p => ({ ...p, [field]: undefined }));
    };

    // Infos lecture seule dérivées du cours
    const autoNiveau   = coursInfo?.niveau?.nom     ?? null;
    const autoFiliere  = coursInfo?.niveau?.filiere ?? null;
    const autoSemestre = coursInfo?.semestre
        ? `Semestre ${coursInfo.semestre.numero?.value ?? coursInfo.semestre.numero ?? ''}`
        : null;
    const autoAnnee    = coursInfo?.semestre?.annee ?? anneeActive?.annee ?? null;

    // Le prof est figé (1 seul) ou à choisir (plusieurs)
    const profUnique = professeursDuCours.length === 1;
    const profNom    = profUnique ? professeursDuCours[0].nom_complet : null;
    const aucunProf  = professeursDuCours.length === 0 && Boolean(coursInfo);

    // ─Validation ─
    const validate = () => {
        const e = {};
        if (!formData.cours_id)      e.cours_id      = 'Le cours est requis';
        if (!formData.professeur_id) e.professeur_id = 'Le professeur est requis';
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
            cours_id:      Number(formData.cours_id),
            professeur_id: Number(formData.professeur_id),
            jour:          formData.jour,
            heure_debut:   formData.heure_debut,
            heure_fin:     formData.heure_fin,
            type_seance:   formData.type_seance,
        });
    };

    const hasCoursSelected = Boolean(formData.cours_id && coursInfo);
    const canSubmit        = hasCoursSelected && Boolean(formData.professeur_id) && !aucunProf;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Sélection du cours */}
            <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Cours</p>

                {coursError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {coursError}
                    </p>
                )}

                <FormSelect
                    id="cours_id"
                    label="Cours"
                    value={formData.cours_id}
                    onValueChange={handleCoursChange}
                    options={coursOptions}
                    placeholder={
                        loadingCours              ? 'Chargement des cours...'  :
                        coursOptions.length === 0 ? 'Aucun cours disponible'  :
                        'Sélectionner un cours...'
                    }
                    error={allErrors.cours_id}
                    disabled={loading || loadingCours}
                    required
                />

                {loadingCours && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
                    </p>
                )}
            </div>

            {/* Informations associées (lecture seule) + Professeur */}
            <div className={`space-y-3 border-t border-gray-100 pt-5 transition-opacity duration-300 ${hasCoursSelected ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'}`}>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Informations associées
                    {!hasCoursSelected && (
                        <span className="ml-2 text-gray-300 normal-case font-normal tracking-normal">
                            — sélectionnez un cours d'abord
                        </span>
                    )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoField icon={GraduationCap} label="Niveau"           value={autoNiveau}   />
                    <InfoField icon={Layers}        label="Filière"          value={autoFiliere}  />
                    <InfoField icon={CalendarDays}  label="Semestre"         value={autoSemestre} />
                    <InfoField icon={Building2}     label="Année académique" value={autoAnnee}    />
                </div>

                {/* Professeur : alerte si aucun, lecture seule si unique, select si plusieurs */}
                {aucunProf ? (
                    <p className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Aucun professeur affecté à ce cours. Affectez-en un avant de planifier une séance.
                    </p>
                ) : profUnique ? (
                    <InfoField
                        icon={User}
                        label="Professeur"
                        value={profNom}
                        className="w-full"
                    />
                ) : (
                    <FormSelect
                        id="professeur_id"
                        label="Professeur"
                        value={formData.professeur_id}
                        onValueChange={v => handleChange('professeur_id', v)}
                        options={professeursOptions}
                        placeholder="Choisir le professeur pour cette séance"
                        error={allErrors.professeur_id}
                        disabled={loading}
                        required
                    />
                )}
            </div>

            {/* Horaire */}
            <div className="space-y-3 border-t border-gray-100 pt-5">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Horaire</p>
                <div className="grid grid-cols-3 gap-3">
                    <FormSelect
                        id="jour" label="Jour"
                        value={formData.jour}
                        onValueChange={v => handleChange('jour', v)}
                        options={JOURS}
                        placeholder="Jour"
                        error={allErrors.jour}
                        disabled={loading}
                        required
                    />
                    <FormInput
                        id="heure_debut" label="Début"
                        type="time" min="08:00" max="20:00"
                        value={formData.heure_debut}
                        onChange={e => handleChange('heure_debut', e.target.value)}
                        error={allErrors.heure_debut}
                        disabled={loading}
                        required
                    />
                    <FormInput
                        id="heure_fin" label="Fin"
                        type="time" min="08:00" max="20:00"
                        value={formData.heure_fin}
                        onChange={e => handleChange('heure_fin', e.target.value)}
                        error={allErrors.heure_fin}
                        disabled={loading}
                        required
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

            {/* Action */}
            <div className="pt-2 border-t border-gray-100">
                <Button type="submit" disabled={loading || !canSubmit} className="w-full">
                    {loading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création du créneau...</>
                        : 'Créer le créneau'
                    }
                </Button>
            </div>
        </form>
    );
}