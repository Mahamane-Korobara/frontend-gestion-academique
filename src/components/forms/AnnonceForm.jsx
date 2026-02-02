'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import ErrorAlert from '@/components/partage/ErrorAlert';

// Hooks & Services
import useAnnounceFormOptions from '@/lib/hooks/useAnnounceFormOptions';
import useAnnonces from '@/lib/hooks/useAnnonces';
import useAuth from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AnnonceForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { createAnnonce } = useAnnonces();
  const { filieres, niveaux, cours, loading: optionsLoading, error: optionsError } = useAnnounceFormOptions();

  // Déterminer si l'utilisateur est un professeur
  const isProfesseur = user?.role?.name === 'professeur';

  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    type: isProfesseur ? 'cours' : 'globale', // Type par défaut selon le rôle
    filiere_id: '',
    niveau_id: '',
    cours_id: '',
    priorite: 'normale',
    date_expiration: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrer les cours du professeur uniquement
  const professorCours = isProfesseur 
    ? cours.filter(c => c.professeur_id === user?.professeur?.id)
    : cours;

  // Extraire les filières et niveaux uniques des cours du professeur
  const professorFilieres = isProfesseur
    ? filieres.filter(f => professorCours.some(c => c.filiere_id === f.id))
    : filieres;

  const professorNiveaux = isProfesseur
    ? niveaux.filter(n => professorCours.some(c => c.niveau_id === n.id))
    : niveaux;

  // Options de type selon le rôle
  const typeOptions = isProfesseur
    ? [
        { value: 'cours', label: 'Par Cours' },
        { value: 'niveau', label: 'Par Niveau' },
        { value: 'filiere', label: 'Par Filière' }
      ]
    : [
        { value: 'globale', label: 'Globale' },
        { value: 'filiere', label: 'Par Filière' },
        { value: 'niveau', label: 'Par Niveau' },
        { value: 'cours', label: 'Par Cours' }
      ];

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

    // Validation supplémentaire pour les professeurs
    if (isProfesseur && formData.type === 'globale') {
      newErrors.type = 'Les professeurs ne peuvent pas créer d\'annonces globales';
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

    // Validation supplémentaire pour les professeurs
    if (isProfesseur && formData.type === 'cours') {
      const selectedCours = professorCours.find(c => c.id.toString() === formData.cours_id);
      if (!selectedCours) {
        newErrors.cours_id = 'Vous pouvez uniquement créer des annonces pour vos cours';
      }
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

    // Effacer l'erreur du champ lorsqu'on commence à taper
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
    // Empêcher les professeurs de sélectionner 'globale'
    if (isProfesseur && value === 'globale') {
      toast.error('Les professeurs ne peuvent pas créer d\'annonces globales');
      return;
    }

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

      await createAnnonce(dataToSubmit);
      toast.success('Annonce créée avec succès');
      
      // Redirection selon le rôle
      if (isProfesseur) {
        router.push('/professeur/annonces');
      } else {
        router.push('/annonces');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      
      // Afficher les erreurs de validation du backend si disponibles
      if (error.validationErrors) {
        const errorMessages = Object.entries(error.validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join(' | ');
        toast.error(`Erreur de validation: ${errorMessages}`);
      } else {
        toast.error(error.message || 'Une erreur est survenue lors de la création de l\'annonce');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un message si le professeur n'a pas de cours
  if (isProfesseur && professorCours.length === 0 && !optionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Aucun cours assigné</CardTitle>
              <CardDescription>
                Vous devez être assigné à au moins un cours pour créer des annonces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Veuillez contacter l'administrateur pour qu'il vous assigne des cours.
              </p>
              <Link href={isProfesseur ? '/professeur/annonces' : '/annonces'}>
                <Button>Retour aux annonces</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={isProfesseur ? '/professeur/annonces' : '/annonces'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nouvelle Annonce
              {isProfesseur && (
                <span className="ml-2 text-base font-normal text-gray-600">
                  (Professeur)
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {isProfesseur 
                ? 'Créez une annonce pour vos cours'
                : 'Créez et publiez une nouvelle annonce'
              }
            </p>
          </div>
        </div>

        {/* Message d'information pour les professeurs */}
        {isProfesseur && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Informations importantes
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Vous pouvez créer des annonces uniquement pour vos cours</li>
              <li>Types disponibles : Cours, Niveau, Filière</li>
              <li>Vous avez actuellement {professorCours.length} cours assigné(s)</li>
            </ul>
          </div>
        )}

        {/* Erreur de chargement des options */}
        {optionsError && (
          <ErrorAlert
            title="Erreur de chargement"
            message="Impossible de charger les options. Veuillez actualiser la page."
          />
        )}

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'annonce</CardTitle>
            <CardDescription>
              Remplissez les champs ci-dessous pour créer une nouvelle annonce
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                required
                maxLength={255}
              />
              <p className="text-xs text-gray-500 -mt-1.5">
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
                rows={5}
                required
              />

              {/* Type et Priorité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type */}
                <FormSelect
                  id="type"
                  label="Type d'annonce"
                  value={formData.type}
                  onValueChange={handleTypeChange}
                  options={typeOptions}
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
                  options={professorFilieres.map((f) => ({ value: f.id.toString(), label: f.nom }))}
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
                  options={professorNiveaux.map((n) => ({ value: n.id.toString(), label: n.nom }))}
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
                  options={professorCours.map((c) => ({ value: c.id.toString(), label: c.titre }))}
                  placeholder="Sélectionner un de vos cours"
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
                  onClick={() => router.push(isProfesseur ? '/professeur/annonces' : '/annonces')}
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
                      Création en cours...
                    </>
                  ) : (
                    'Créer l\'annonce'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}