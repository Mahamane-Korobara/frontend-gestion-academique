'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';

export default function NiveauForm({
  serverErrors = {},
  niveau = null,
  filieresOptions = [],  // activeFilieresOptions depuis useFilieres
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEditMode = !!niveau;

  const [formData, setFormData] = useState({
    filiere_id:       '',
    nom:              '',
    ordre:            '',
    nombre_semestres: '2',
  });

  const [errors, setErrors] = useState({});

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
    if (!niveau) return;
    setFormData({
      filiere_id:       niveau.filiere?.id ? String(niveau.filiere.id) : '',
      nom:              niveau.nom              || '',
      ordre:            niveau.ordre            ? String(niveau.ordre) : '',
      nombre_semestres: niveau.nombre_semestres ? String(niveau.nombre_semestres) : '2',
    });
  }, [niveau]);

  const validate = () => {
    const e = {};
    if (!formData.filiere_id)   e.filiere_id       = 'La filière est requise';
    if (!formData.nom.trim())   e.nom               = 'Le nom est requis';
    if (!formData.ordre)        e.ordre             = "L'ordre est requis";
    else if (Number(formData.ordre) < 1)
                                e.ordre             = "L'ordre doit être ≥ 1";
    if (!formData.nombre_semestres)
                                e.nombre_semestres  = 'Le nombre de semestres est requis';
    else if (
      Number(formData.nombre_semestres) < 1 ||
      Number(formData.nombre_semestres) > 4
    )                           e.nombre_semestres  = 'Entre 1 et 4 semestres';
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
    onSubmit?.({
      filiere_id:       Number(formData.filiere_id),
      nom:              formData.nom.trim(),
      ordre:            Number(formData.ordre),
      nombre_semestres: Number(formData.nombre_semestres),
    });
  };

  const semestresOptions = [
    { value: '1', label: '1 semestre' },
    { value: '2', label: '2 semestres' },
    { value: '3', label: '3 semestres' },
    { value: '4', label: '4 semestres' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Rattachement */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          Rattachement
        </h3>
        <FormSelect
          id="filiere_id"
          label="Filière"
          value={formData.filiere_id}
          onValueChange={(v) => handleChange('filiere_id', v)}
          options={filieresOptions}
          placeholder="Choisir une filière"
          error={allErrors.filiere_id}
          disabled={isEditMode || loading} // non modifiable en édition
          required
        />
      </div>

      {/* Informations */}
      <div className="space-y-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          Informations
        </h3>
        <FormInput
          id="nom"
          label="Nom du niveau"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          error={allErrors.nom}
          disabled={loading}
          required
          placeholder="Ex : L1, L2, M1..."
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            id="ordre"
            label="Ordre d'affichage"
            type="number"
            min={1}
            value={formData.ordre}
            onChange={(e) => handleChange('ordre', e.target.value)}
            error={allErrors.ordre}
            disabled={loading}
            required
            placeholder="1"
          />
          <FormSelect
            id="nombre_semestres"
            label="Nombre de semestres"
            value={formData.nombre_semestres}
            onValueChange={(v) => handleChange('nombre_semestres', v)}
            options={semestresOptions}
            error={allErrors.nombre_semestres}
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="min-w-30">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Modification...' : 'Création...'}
            </>
          ) : isEditMode ? (
            'Modifier'
          ) : (
            'Créer'
          )}
        </Button>
      </div>
    </form>
  );
}