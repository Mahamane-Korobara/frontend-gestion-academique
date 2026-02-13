'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

export default function UserForm({
  user = null,
  filieres = [],
  niveauxOptions = [],
  getNiveauxByFiliere = () => niveauxOptions,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    email: '',
    role: 'etudiant',
    nom: '',
    prenom: '',
    matricule: '',
    date_naissance: '',
    sexe: '',
    filiere_id: '',
    niveau_id: '',
    lieu_naissance: '',
    adresse: '',
    email_personnel: '',
    telephone_etudiant: '',
    telephone_urgence: '',
    code_professeur: '',
    specialite: '',
    grade: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    const et = user.etudiant || {};
    const pr = user.professeur || {};
    const role = user.role?.name || 'etudiant';
    setFormData({
      email: user.email || '',
      role,
      nom: role === 'etudiant' ? et.nom || '' : pr.nom || '',
      prenom: role === 'etudiant' ? et.prenom || '' : pr.prenom || '',
      matricule: et.matricule || '',
      date_naissance: et.date_naissance || '',
      sexe: et.sexe || '',
      filiere_id: et.filiere_id ? String(et.filiere_id) : '',
      niveau_id: et.niveau_id ? String(et.niveau_id) : '',
      lieu_naissance: et.lieu_naissance || '',
      adresse: et.adresse || '',
      email_personnel: et.email_personnel || '',
      telephone_etudiant: et.telephone || '',
      telephone_urgence: et.telephone_urgence || '',
      code_professeur: pr.code_professeur || '',
      specialite: pr.specialite || '',
      grade: pr.grade || '',
      bio: pr.bio || '',
    });
  }, [user]);

  // Niveaux filtrés par filière (si l'API supporte filiere_id)
  const filteredNiveaux = useMemo(() => {
    if (!formData.filiere_id) return niveauxOptions;
    const byFiliere = getNiveauxByFiliere(formData.filiere_id);
    return byFiliere.length > 0 ? byFiliere : niveauxOptions;
  }, [formData.filiere_id, getNiveauxByFiliere, niveauxOptions]);

  const handleFiliereChange = (value) => {
    setFormData((prev) => ({ ...prev, filiere_id: value, niveau_id: '' }));
    setErrors((prev) => ({
      ...prev,
      filiere_id: undefined,
      niveau_id: undefined,
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Email invalide';
    if (!formData.nom.trim()) e.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) e.prenom = 'Le prénom est requis';
    if (formData.role === 'etudiant') {
      if (!formData.matricule.trim()) e.matricule = 'Le matricule est requis';
      if (!formData.date_naissance)
        e.date_naissance = 'La date de naissance est requise';
      if (!formData.sexe) e.sexe = 'Le sexe est requis';
      if (!formData.filiere_id) e.filiere_id = 'La filière est requise';
      if (!formData.niveau_id) e.niveau_id = 'Le niveau est requis';
    }
    if (formData.role === 'professeur') {
      if (!formData.code_professeur.trim())
        e.code_professeur = 'Le code professeur est requis';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const name = `${formData.prenom.trim()} ${formData.nom.trim()}`;
    const submitData = { name, email: formData.email, role: formData.role };

    if (formData.role === 'etudiant') {
      submitData.etudiant = {
        matricule: formData.matricule,
        nom: formData.nom,
        prenom: formData.prenom,
        date_naissance: formData.date_naissance,
        sexe: formData.sexe,
        filiere_id: Number(formData.filiere_id),
        niveau_id: Number(formData.niveau_id), // vrai ID depuis l'API
        ...(formData.lieu_naissance && {
          lieu_naissance: formData.lieu_naissance,
        }),
        ...(formData.adresse && { adresse: formData.adresse }),
        ...(formData.email_personnel && {
          email_personnel: formData.email_personnel,
        }),
        ...(formData.telephone_etudiant && {
          telephone: formData.telephone_etudiant,
        }),
        ...(formData.telephone_urgence && {
          telephone_urgence: formData.telephone_urgence,
        }),
      };
    } else {
      submitData.professeur = {
        code_professeur: formData.code_professeur,
        nom: formData.nom,
        prenom: formData.prenom,
        ...(formData.specialite && { specialite: formData.specialite }),
        ...(formData.grade && { grade: formData.grade }),
        ...(formData.bio && { bio: formData.bio }),
      };
    }
    onSubmit?.(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const filieresSelectOptions = filieres.map((f) => ({
    value: String(f.id),
    label: f.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Compte */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          Compte
        </h3>
        <FormInput
          id="email"
          label="Adresse email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          disabled={loading}
          required
          placeholder="jean.dupont@universite.dz"
        />
        <FormSelect
          id="role"
          label="Rôle"
          value={formData.role}
          onValueChange={(v) => handleChange('role', v)}
          options={[
            { value: 'etudiant', label: 'Étudiant' },
            { value: 'professeur', label: 'Professeur' },
          ]}
          error={errors.role}
          disabled={isEditMode || loading}
          required
        />
      </div>

      {/* Identité */}
      <div className="space-y-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          Identité
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            id="prenom"
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => handleChange('prenom', e.target.value)}
            error={errors.prenom}
            disabled={loading}
            required
            placeholder="Jean"
          />
          <FormInput
            id="nom"
            label="Nom"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            error={errors.nom}
            disabled={loading}
            required
            placeholder="Dupont"
          />
        </div>
      </div>

      {/* Infos spécifiques */}
      <div className="space-y-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
          {formData.role === 'etudiant'
            ? 'Informations étudiant'
            : 'Informations professeur'}
        </h3>

        {formData.role === 'etudiant' ? (
          <>
            <FormInput
              id="matricule"
              label="Matricule"
              value={formData.matricule}
              onChange={(e) => handleChange('matricule', e.target.value)}
              error={errors.matricule}
              disabled={loading}
              required
              placeholder="STU2025001"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="date_naissance"
                label="Date de naissance"
                type="date"
                value={formData.date_naissance}
                onChange={(e) => handleChange('date_naissance', e.target.value)}
                error={errors.date_naissance}
                disabled={loading}
                required
              />
              <FormSelect
                id="sexe"
                label="Sexe"
                value={formData.sexe}
                onValueChange={(v) => handleChange('sexe', v)}
                options={[
                  { value: 'M', label: 'Masculin' },
                  { value: 'F', label: 'Féminin' },
                ]}
                placeholder="Sélectionner"
                error={errors.sexe}
                disabled={loading}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                id="filiere_id"
                label="Filière"
                value={formData.filiere_id}
                onValueChange={handleFiliereChange}
                options={filieresSelectOptions}
                placeholder="Choisir une filière"
                error={errors.filiere_id}
                disabled={loading}
                required
              />
              <FormSelect
                id="niveau_id"
                label="Niveau"
                value={formData.niveau_id}
                onValueChange={(v) => handleChange('niveau_id', v)}
                options={filteredNiveaux}
                placeholder={
                  formData.filiere_id
                    ? 'Choisir un niveau'
                    : "D'abord une filière"
                }
                error={errors.niveau_id}
                disabled={loading || !formData.filiere_id}
                required
              />
            </div>
            <details className="group">
              <summary className="cursor-pointer text-xs text-gray-500 select-none hover:text-gray-700">
                + Informations complémentaires (optionnel)
              </summary>
              <div className="mt-3 space-y-3">
                <FormInput
                  id="lieu_naissance"
                  label="Lieu de naissance"
                  value={formData.lieu_naissance}
                  onChange={(e) =>
                    handleChange('lieu_naissance', e.target.value)
                  }
                  disabled={loading}
                  placeholder="Ex: Alger"
                />
                <FormInput
                  id="adresse"
                  label="Adresse"
                  value={formData.adresse}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  disabled={loading}
                />
                <FormInput
                  id="email_personnel"
                  label="Email personnel"
                  type="email"
                  value={formData.email_personnel}
                  onChange={(e) =>
                    handleChange('email_personnel', e.target.value)
                  }
                  disabled={loading}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    id="telephone_etudiant"
                    label="Téléphone"
                    type="tel"
                    value={formData.telephone_etudiant}
                    onChange={(e) =>
                      handleChange('telephone_etudiant', e.target.value)
                    }
                    disabled={loading}
                  />
                  <FormInput
                    id="telephone_urgence"
                    label="Tél. urgence"
                    type="tel"
                    value={formData.telephone_urgence}
                    onChange={(e) =>
                      handleChange('telephone_urgence', e.target.value)
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </details>
          </>
        ) : (
          <>
            <FormInput
              id="code_professeur"
              label="Code professeur"
              value={formData.code_professeur}
              onChange={(e) => handleChange('code_professeur', e.target.value)}
              error={errors.code_professeur}
              disabled={loading}
              required
              placeholder="PROF2025001"
            />
            <FormSelect
              id="specialite"
              label="Spécialité (optionnel)"
              value={formData.specialite}
              onValueChange={(v) => handleChange('specialite', v)}
              options={filieresSelectOptions}
              placeholder="Sélectionner"
              disabled={loading}
            />
            <FormSelect
              id="grade"
              label="Grade (optionnel)"
              value={formData.grade}
              onValueChange={(v) => handleChange('grade', v)}
              options={[
                { value: 'Assistant', label: 'Assistant' },
                { value: 'Maître assistant', label: 'Maître assistant' },
                {
                  value: 'Maître de conférences',
                  label: 'Maître de conférences',
                },
                { value: 'Professeur', label: 'Professeur' },
              ]}
              placeholder="Sélectionner"
              disabled={loading}
            />
            <FormInput
              id="bio"
              label="Bio (optionnel)"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              disabled={loading}
              placeholder="Courte biographie..."
            />
          </>
        )}
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
