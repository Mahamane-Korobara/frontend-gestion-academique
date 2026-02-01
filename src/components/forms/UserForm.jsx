'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'aria-invalid:border-destructive' : ''}
            placeholder="Ex: Jean Dupont"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'aria-invalid:border-destructive' : ''}
            placeholder="jean.dupont@exemple.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Rôle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Rôle <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled={isEditMode} // Ne pas changer le rôle en édition
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="etudiant">Étudiant</option>
            <option value="professeur">Professeur</option>
          </select>
        </div>
      </div>

      {/* Champs spécifiques au rôle */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Informations spécifiques
        </h3>

        {formData.role === 'etudiant' ? (
          <>
            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Matricule <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.matricule}
                onChange={(e) => handleChange('matricule', e.target.value)}
                className={errors.matricule ? 'aria-invalid:border-destructive' : ''}
                placeholder="Ex: STU2025001"
              />
              {errors.matricule && (
                <p className="mt-1 text-xs text-red-500">{errors.matricule}</p>
              )}
            </div>

            {/* Filière */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Filière <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.filiere}
                onChange={(e) => handleChange('filiere', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.filiere 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Sélectionner une filière</option>
                {filieres.map((filiere) => (
                  <option key={filiere.value} value={filiere.label}>
                    {filiere.label}
                  </option>
                ))}
              </select>
              {errors.filiere && (
                <p className="mt-1 text-xs text-red-500">{errors.filiere}</p>
              )}
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Niveau <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.niveau}
                onChange={(e) => handleChange('niveau', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.niveau 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Sélectionner un niveau</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
              {errors.niveau && (
                <p className="mt-1 text-xs text-red-500">{errors.niveau}</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Code Professeur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code Professeur <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className={errors.code ? 'aria-invalid:border-destructive' : ''}
                placeholder="Ex: PROF2025001"
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-500">{errors.code}</p>
              )}
            </div>

            {/* Spécialité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Spécialité <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.specialite}
                onChange={(e) => handleChange('specialite', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.specialite 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Sélectionner une spécialité</option>
                {filieres.map((filiere) => (
                  <option key={filiere.value} value={filiere.label}>
                    {filiere.label}
                  </option>
                ))}
              </select>
              {errors.specialite && (
                <p className="mt-1 text-xs text-red-500">{errors.specialite}</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Grade
              </label>
              <select
                value={formData.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Sélectionner un grade</option>
                <option value="Assistant">Assistant</option>
                <option value="Maître assistant">Maître assistant</option>
                <option value="Maître de conférences">Maître de conférences</option>
                <option value="Professeur">Professeur</option>
              </select>
            </div>
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