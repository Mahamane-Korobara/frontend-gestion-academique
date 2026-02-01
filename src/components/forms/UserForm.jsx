'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

/**
 * Formulaire réutilisable pour créer ou modifier un utilisateur
 * @param {Object} user - Utilisateur à modifier (null pour création)
 * @param {Array} filieres - Liste des filières disponibles
 * @param {Function} onSubmit - Callback lors de la soumission
 * @param {Function} onCancel - Callback lors de l'annulation
 * @param {boolean} loading - État de chargement
 */
export default function UserForm({ 
  user = null, 
  filieres = [],
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'etudiant',
    // Champs spécifiques étudiant
    matricule: '',
    filiere: '',
    niveau: '',
    // Champs spécifiques professeur
    code: '',
    specialite: '',
    grade: '',
  });

  const [errors, setErrors] = useState({});

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role?.name || 'etudiant',
        matricule: user.profile?.matricule || '',
        filiere: user.profile?.filiere || '',
        niveau: user.profile?.niveau || '',
        code: user.profile?.code || '',
        specialite: user.profile?.specialite || '',
        grade: user.profile?.grade || '',
      });
    }
  }, [user]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.role === 'etudiant') {
      if (!formData.matricule.trim()) {
        newErrors.matricule = 'Le matricule est requis';
      }
      if (!formData.filiere.trim()) {
        newErrors.filiere = 'La filière est requise';
      }
      if (!formData.niveau.trim()) {
        newErrors.niveau = 'Le niveau est requis';
      }
    }

    if (formData.role === 'professeur') {
      if (!formData.code.trim()) {
        newErrors.code = 'Le code professeur est requis';
      }
      if (!formData.specialite.trim()) {
        newErrors.specialite = 'La spécialité est requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler de soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Préparer les données selon le rôle
      const submitData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        profile: formData.role === 'etudiant' 
          ? {
              matricule: formData.matricule,
              filiere: formData.filiere,
              niveau: formData.niveau,
            }
          : {
              code: formData.code,
              specialite: formData.specialite,
              grade: formData.grade,
            }
      };

      onSubmit?.(submitData);
    }
  };

  // Handler de changement de champ
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Informations générales
        </h3>

        {/* Nom */}
        <FormInput
          id="name"
          name="name"
          label="Nom complet"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          disabled={loading}
          required
          placeholder="Ex: Jean Dupont"
        />

        {/* Email */}
        <FormInput
          id="email"
          name="email"
          label="Adresse email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          disabled={loading}
          required
          placeholder="jean.dupont@exemple.com"
        />

        {/* Rôle */}
        <FormSelect
          id="role"
          label="Rôle"
          value={formData.role}
          onValueChange={(value) => handleChange('role', value)}
          options={[
            { value: 'etudiant', label: 'Étudiant' },
            { value: 'professeur', label: 'Professeur' }
          ]}
          error={errors.role}
          disabled={isEditMode || loading}
          required
        />
      </div>

      {/* Champs spécifiques au rôle */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Informations spécifiques
        </h3>

        {formData.role === 'etudiant' ? (
          <>
            {/* Matricule */}
            <FormInput
              id="matricule"
              name="matricule"
              label="Matricule"
              type="text"
              value={formData.matricule}
              onChange={(e) => handleChange('matricule', e.target.value)}
              error={errors.matricule}
              disabled={loading}
              required
              placeholder="Ex: STU2025001"
            />

            {/* Filière */}
            <FormSelect
              id="filiere"
              label="Filière"
              value={formData.filiere}
              onValueChange={(value) => handleChange('filiere', value)}
              options={filieres.map(f => ({ value: f.label, label: f.label }))}
              placeholder="Sélectionner une filière"
              error={errors.filiere}
              disabled={loading}
              required
            />

            {/* Niveau */}
            <FormSelect
              id="niveau"
              label="Niveau"
              value={formData.niveau}
              onValueChange={(value) => handleChange('niveau', value)}
              options={[
                { value: 'L1', label: 'L1' },
                { value: 'L2', label: 'L2' },
                { value: 'L3', label: 'L3' },
                { value: 'M1', label: 'M1' },
                { value: 'M2', label: 'M2' }
              ]}
              placeholder="Sélectionner un niveau"
              error={errors.niveau}
              disabled={loading}
              required
            />
          </>
        ) : (
          <>
            {/* Code Professeur */}
            <FormInput
              id="code"
              name="code"
              label="Code Professeur"
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              error={errors.code}
              disabled={loading}
              required
              placeholder="Ex: PROF2025001"
            />

            {/* Spécialité */}
            <FormSelect
              id="specialite"
              label="Spécialité"
              value={formData.specialite}
              onValueChange={(value) => handleChange('specialite', value)}
              options={filieres.map(f => ({ value: f.label, label: f.label }))}
              placeholder="Sélectionner une spécialité"
              error={errors.specialite}
              disabled={loading}
              required
            />

            {/* Grade */}
            <FormSelect
              id="grade"
              label="Grade"
              value={formData.grade}
              onValueChange={(value) => handleChange('grade', value)}
              options={[
                { value: 'Assistant', label: 'Assistant' },
                { value: 'Maître assistant', label: 'Maître assistant' },
                { value: 'Maître de conférences', label: 'Maître de conférences' },
                { value: 'Professeur', label: 'Professeur' }
              ]}
              placeholder="Sélectionner un grade"
              error={errors.grade}
              disabled={loading}
            />
          </>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditMode ? 'Modification...' : 'Création...'}
            </>
          ) : (
            isEditMode ? 'Modifier' : 'Créer'
          )}
        </Button>
      </div>
    </form>
  );
}