'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import ErrorAlert from '@/components/partage/ErrorAlert';

// Hooks et Services
import useAnnounceFormOptions from '@/lib/hooks/useAnnounceFormOptions';
import useAnnonces from '@/lib/hooks/useAnnonces';

export default function AnnonceEditModal({ annonce, onClose }) {
  const { updateAnnonce } = useAnnonces();
  const { filieres, niveaux, cours, loading: optionsLoading } = useAnnounceFormOptions();

  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    type: 'globale',
    filiere_id: '',
    niveau_id: '',
    cours_id: '',
    priorite: 'normale',
    date_expiration: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données de l'annonce
  useEffect(() => {
    if (annonce) {
      setFormData({
        titre: annonce.titre || '',
        contenu: annonce.contenu || '',
        type: annonce.type?.code || 'globale',
        filiere_id: annonce.cible?.filiere_id?.toString() || '',
        niveau_id: annonce.cible?.niveau_id?.toString() || '',
        cours_id: annonce.cible?.cours_id?.toString() || '',
        priorite: annonce.priorite?.code || 'normale',
        date_expiration: annonce.date_expiration || '',
      });
    }
  }, [annonce]);

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    } else if (formData.titre.length > 255) {
      newErrors.titre = 'Le titre ne peut pas dépasser 255 caractères';
    }

    if (!formData.contenu.trim()) {
      newErrors.contenu = 'Le contenu est requis';
    }

    if (!formData.type) {
      newErrors.type = 'Le type d\'annonce est requis';
    }

    if (!formData.priorite) {
      newErrors.priorite = 'La priorité est requise';
    }

    // Validations conditionnelles selon le type
    if (formData.type === 'filiere' && !formData.filiere_id) {
      newErrors.filiere_id = 'Veuillez sélectionner une filière';
    }

    if (formData.type === 'niveau' && !formData.niveau_id) {
      newErrors.niveau_id = 'Veuillez sélectionner un niveau';
    }

    if (formData.type === 'cours' && !formData.cours_id) {
      newErrors.cours_id = 'Veuillez sélectionner un cours';
    }

    // Validation de la date
    if (formData.date_expiration) {
      const selectedDate = new Date(formData.date_expiration);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.date_expiration = 'La date d\'expiration doit être après aujourd\'hui';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler de changement d'input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handler de changement de select
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handler de changement du type d'annonce
  const handleTypeChange = (value) => {
    // Réinitialiser les champs conditionnels
    setFormData((prev) => ({
      ...prev,
      type: value,
      filiere_id: '',
      niveau_id: '',
      cours_id: '',
    }));

    // Effacer les erreurs
    setErrors((prev) => ({
      ...prev,
      filiere_id: '',
      niveau_id: '',
      cours_id: '',
    }));
  };

  // Handler de soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider le formulaire
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données à envoyer
      const dataToSubmit = {
        titre: formData.titre,
        contenu: formData.contenu,
        type: formData.type,
        priorite: formData.priorite,
        date_expiration: formData.date_expiration || null,
      };

      // Ajouter les champs conditionnels s'ils sont remplis
      if (formData.type === 'filiere' && formData.filiere_id) {
        dataToSubmit.filiere_id = parseInt(formData.filiere_id);
      }
      if (formData.type === 'niveau' && formData.niveau_id) {
        dataToSubmit.niveau_id = parseInt(formData.niveau_id);
      }
      if (formData.type === 'cours' && formData.cours_id) {
        dataToSubmit.cours_id = parseInt(formData.cours_id);
      }

    //   console.log('Données envoyées au backend:', dataToSubmit);
      await updateAnnonce(annonce.id, dataToSubmit);
      toast.success('Annonce modifiée avec succès');
      
      // Attendre un peu pour que les mises à jour optimistes soient appliquées
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      
      // Afficher les erreurs de validation du backend si disponibles
      if (error.validationErrors) {
        const errorMessages = Object.entries(error.validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join(' | ');
        toast.error(`Erreur de validation: ${errorMessages}`);
      } else {
        toast.error(error.message || 'Une erreur est survenue lors de la modification de l\'annonce');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!annonce) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <FormInput
        id="titre"
        name="titre"
        label="Titre"
        type="text"
        placeholder="Entrez le titre de l'annonce"
        value={formData.titre}
        onChange={handleChange}
        error={errors.titre}
        disabled={isSubmitting || optionsLoading}
        maxLength={255}
        required
      />
      <p className="text-xs text-gray-500 -mt-4">
        {formData.titre.length}/255 caractères
      </p>

      {/* Contenu */}
      <FormTextarea
        id="contenu"
        name="contenu"
        label="Contenu"
        placeholder="Entrez le contenu détaillé de l'annonce"
        value={formData.contenu}
        onChange={handleChange}
        error={errors.contenu}
        disabled={isSubmitting || optionsLoading}
        rows={4}
        required
      />

      {/* Type et Priorité */}
      <div className="grid grid-cols-2 gap-4">
        {/* Type */}
        <FormSelect
          id="type"
          label="Type d'annonce"
          value={formData.type}
          onValueChange={handleTypeChange}
          options={[
            { value: 'globale', label: 'Globale' },
            { value: 'filiere', label: 'Par Filière' },
            { value: 'niveau', label: 'Par Niveau' },
            { value: 'cours', label: 'Par Cours' }
          ]}
          error={errors.type}
          disabled={isSubmitting || optionsLoading}
          required
        />

        {/* Priorité */}
        <FormSelect
          id="priorite"
          label="Priorité"
          value={formData.priorite}
          onValueChange={(value) => handleSelectChange('priorite', value)}
          options={[
            { value: 'normale', label: 'Normale' },
            { value: 'importante', label: 'Importante' },
            { value: 'urgente', label: 'Urgente' }
          ]}
          error={errors.priorite}
          disabled={isSubmitting || optionsLoading}
          required
        />
      </div>

      {/* Champs conditionnels */}
      {formData.type === 'filiere' && (
        <FormSelect
          id="filiere_id"
          label="Filière"
          value={formData.filiere_id}
          onValueChange={(value) => handleSelectChange('filiere_id', value)}
          options={filieres.map((f) => ({ value: f.id.toString(), label: f.nom }))}
          placeholder="Sélectionner une filière"
          error={errors.filiere_id}
          disabled={isSubmitting || optionsLoading}
          required
        />
      )}

      {formData.type === 'niveau' && (
        <FormSelect
          id="niveau_id"
          label="Niveau"
          value={formData.niveau_id}
          onValueChange={(value) => handleSelectChange('niveau_id', value)}
          options={niveaux.map((n) => ({ value: n.id.toString(), label: n.nom }))}
          placeholder="Sélectionner un niveau"
          error={errors.niveau_id}
          disabled={isSubmitting || optionsLoading}
          required
        />
      )}

      {formData.type === 'cours' && (
        <FormSelect
          id="cours_id"
          label="Cours"
          value={formData.cours_id}
          onValueChange={(value) => handleSelectChange('cours_id', value)}
          options={cours.map((c) => ({ value: c.id.toString(), label: c.titre }))}
          placeholder="Sélectionner un cours"
          error={errors.cours_id}
          disabled={isSubmitting || optionsLoading}
          required
        />
      )}

      {/* Date d'expiration */}
      <FormInput
        id="date_expiration"
        name="date_expiration"
        label="Date d'expiration (optionnel)"
        type="date"
        value={formData.date_expiration}
        onChange={handleChange}
        error={errors.date_expiration}
        disabled={isSubmitting || optionsLoading}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting || optionsLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting || optionsLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Modification en cours...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </Button>
      </div>
    </form>
  );
}
