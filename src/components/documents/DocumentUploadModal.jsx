'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';

// Hooks et Services
import useDocumentFormOptions from '@/lib/hooks/useDocumentFormOptions';
import useDocuments from '@/lib/hooks/useDocuments';
import useAuth from '@/lib/hooks/useAuth';

// Types de documents
const DOCUMENT_TYPES = [
  { value: 'pdf', label: 'PDF', accept: '.pdf', mimes: 'application/pdf' },
  { value: 'word', label: 'Word', accept: '.doc,.docx', mimes: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { value: 'excel', label: 'Excel', accept: '.xls,.xlsx', mimes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { value: 'powerpoint', label: 'PowerPoint', accept: '.ppt,.pptx', mimes: 'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { value: 'image', label: 'Image', accept: '.jpg,.jpeg,.png,.gif,.webp', mimes: 'image/jpeg,image/png,image/gif,image/webp' }
];

export default function DocumentUploadModal({ onClose }) {
  const { user } = useAuth();
  const { uploadDocument } = useDocuments();
  const { filieres, niveaux, cours, loading: optionsLoading } = useDocumentFormOptions();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'pdf',
    filiere_id: '',
    niveau_id: '',
    cours_id: '',
    date_expiration: '',
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrer les cours selon le niveau sélectionné
  const filteredCours = cours.filter(c => 
    !formData.niveau_id || c.niveau_id?.toString() === formData.niveau_id
  );

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    } else if (formData.titre.length > 255) {
      newErrors.titre = 'Le titre ne peut pas dépasser 255 caractères';
    }

    if (!formData.type) {
      newErrors.type = 'Le type de document est requis';
    }

    if (!formData.filiere_id) {
      newErrors.filiere_id = 'Veuillez sélectionner une filière';
    }

    if (!formData.niveau_id) {
      newErrors.niveau_id = 'Veuillez sélectionner un niveau';
    }

    if (!formData.cours_id) {
      newErrors.cours_id = 'Veuillez sélectionner un cours';
    }

    if (!file) {
      newErrors.fichier = 'Veuillez sélectionner un fichier';
    } else {
      // Vérifier la taille (max 10 MB)
      const maxSize = 40 * 1024 * 1024; // 10 MB
      if (file.size > maxSize) {
        newErrors.fichier = 'Le fichier ne doit pas dépasser 10 MB';
      }

      // Vérifier le type MIME
      const selectedType = DOCUMENT_TYPES.find(t => t.value === formData.type);
      if (selectedType) {
        const allowedMimes = selectedType.mimes.split(',');
        if (!allowedMimes.includes(file.type)) {
          newErrors.fichier = `Le fichier doit être de type ${selectedType.label}`;
        }
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

    // Si on change le niveau, réinitialiser le cours
    if (name === 'niveau_id') {
      setFormData((prev) => ({
        ...prev,
        cours_id: '',
      }));
    }

    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handler de sélection de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Pré-remplir le titre si vide
      if (!formData.titre) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Retirer l'extension
        setFormData((prev) => ({
          ...prev,
          titre: fileName,
        }));
      }

      // Effacer l'erreur de fichier
      if (errors.fichier) {
        setErrors((prev) => ({
          ...prev,
          fichier: '',
        }));
      }
    }
  };

  // Supprimer le fichier sélectionné
  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById('fichier');
    if (fileInput) fileInput.value = '';
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
      // Créer le FormData
      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('filiere_id', formData.filiere_id);
      formDataToSend.append('niveau_id', formData.niveau_id);
      formDataToSend.append('cours_id', formData.cours_id);
      formDataToSend.append('fichier', file);
      
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      
      if (formData.date_expiration) {
        formDataToSend.append('date_expiration', formData.date_expiration);
      }

      await uploadDocument(formDataToSend);
      toast.success('Document téléchargé avec succès');
      
      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        type: 'pdf',
        filiere_id: '',
        niveau_id: '',
        cours_id: '',
        date_expiration: '',
      });
      setFile(null);
      
      // Attendre un peu pour que les mises à jour soient appliquées
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      
      // Afficher les erreurs de validation du backend si disponibles
      if (error.validationErrors) {
        const errorMessages = Object.entries(error.validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join(' | ');
        toast.error(`Erreur de validation: ${errorMessages}`);
      } else {
        toast.error(error.message || 'Une erreur est survenue lors du téléchargement du document');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload de fichier */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Fichier <span className="text-red-500">*</span>
        </label>
        
        {!file ? (
          <div className="relative">
            <input
              id="fichier"
              type="file"
              onChange={handleFileChange}
              accept={DOCUMENT_TYPES.find(t => t.value === formData.type)?.accept}
              className="hidden"
              disabled={isSubmitting || optionsLoading}
            />
            <label
              htmlFor="fichier"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Cliquez pour sélectionner un fichier</span>
              <span className="text-xs text-gray-500 mt-1">Max 10 MB</span>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Upload className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleRemoveFile}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {errors.fichier && (
          <p className="text-sm text-red-600 mt-1">{errors.fichier}</p>
        )}
      </div>

      {/* Type de document */}
      <FormSelect
        id="type"
        label="Type de document"
        value={formData.type}
        onValueChange={(value) => {
          handleSelectChange('type', value);
          // Réinitialiser le fichier si le type change
          handleRemoveFile();
        }}
        options={DOCUMENT_TYPES}
        error={errors.type}
        disabled={isSubmitting || optionsLoading}
        required
      />

      {/* Titre */}
      <FormInput
        id="titre"
        name="titre"
        label="Titre"
        type="text"
        placeholder="Entrez le titre du document"
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

      {/* Description */}
      <FormTextarea
        id="description"
        name="description"
        label="Description (optionnel)"
        placeholder="Ajoutez une description pour aider les étudiants"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        disabled={isSubmitting || optionsLoading}
        rows={3}
      />

      {/* Filière, Niveau, Cours */}
      <div className="space-y-4">
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

        <FormSelect
          id="cours_id"
          label="Cours"
          value={formData.cours_id}
          onValueChange={(value) => handleSelectChange('cours_id', value)}
          options={filteredCours.map((c) => ({ value: c.id.toString(), label: `${c.titre} (${c.code})` }))}
          placeholder={formData.niveau_id ? "Sélectionner un cours" : "Sélectionnez d'abord un niveau"}
          error={errors.cours_id}
          disabled={isSubmitting || optionsLoading || !formData.niveau_id}
          required
        />
      </div>

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
              Téléchargement en cours...
            </>
          ) : (
            'Télécharger le document'
          )}
        </Button>
      </div>
    </form>
  );
}