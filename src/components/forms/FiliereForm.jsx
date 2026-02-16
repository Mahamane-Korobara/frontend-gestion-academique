'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';

export default function FiliereForm({
  serverErrors = {},
  filiere = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEditMode = !!filiere;

  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    duree_annees: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Aplatit les clés Laravel "nom" → "nom"
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
    if (!filiere) return;
    setFormData({
      nom:          filiere.nom          || '',
      code:         filiere.code         || '',
      duree_annees: filiere.duree_annees ? String(filiere.duree_annees) : '',
      description:  filiere.description  || '',
    });
  }, [filiere]);

  const validate = () => {
    const e = {};
    if (!formData.nom.trim())          e.nom          = 'Le nom est requis';
    if (!formData.code.trim())         e.code         = 'Le code est requis';
    if (!formData.duree_annees)        e.duree_annees = 'La durée est requise';
    else if (
      isNaN(Number(formData.duree_annees)) ||
      Number(formData.duree_annees) < 1   ||
      Number(formData.duree_annees) > 10
    ) e.duree_annees = 'La durée doit être entre 1 et 10 ans';
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
      nom:          formData.nom.trim(),
      code:         formData.code.trim().toUpperCase(),
      duree_annees: Number(formData.duree_annees),
      description:  formData.description.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Identification */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          Identification
        </h3>
        <FormInput
          id="nom"
          label="Nom de la filière"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          error={allErrors.nom}
          disabled={loading}
          required
          placeholder="Ex : Informatique"
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            id="code"
            label="Code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            error={allErrors.code}
            disabled={loading}
            required
            placeholder="Ex : INFO"
          />
          <FormInput
            id="duree_annees"
            label="Durée (années)"
            type="number"
            min={1}
            max={10}
            value={formData.duree_annees}
            onChange={(e) => handleChange('duree_annees', e.target.value)}
            error={allErrors.duree_annees}
            disabled={loading}
            required
            placeholder="3"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          Description
        </h3>
        <div className="space-y-1">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={loading}
            placeholder="Décrivez brièvement la filière..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          {allErrors.description && (
            <p className="text-xs text-red-500">{allErrors.description}</p>
          )}
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