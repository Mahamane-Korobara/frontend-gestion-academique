// components/annonces/AnnonceTypeSelect.jsx
'use client';

import { useEffect } from 'react';
import useAuth from '@/lib/hooks/useAuth';
import FormSelect from '@/components/forms/FormSelect';

/**
 * Composant de sélection du type d'annonce
 * Restreint automatiquement les options pour les professeurs
 */
export default function AnnonceTypeSelect({ value, onChange, error }) {
  const { user } = useAuth();
  const isProfesseur = user?.role?.name === 'professeur';

  // Options disponibles selon le rôle
  const typeOptions = isProfesseur
    ? [
        { value: 'classe', label: 'Classe' },
        { value: 'evenement', label: 'Événement' },
        { value: 'urgent', label: 'Urgent' },
      ]
    : [
        { value: 'globale', label: 'Globale' },
        { value: 'classe', label: 'Classe' },
        { value: 'evenement', label: 'Événement' },
        { value: 'urgent', label: 'Urgent' },
      ];

  // Si un professeur a sélectionné 'globale' par erreur, forcer 'classe'
  useEffect(() => {
    if (isProfesseur && value === 'globale') {
      onChange('classe');
    }
  }, [isProfesseur, value, onChange]);

  return (
    <FormSelect
      label="Type d'annonce"
      name="type"
      value={value}
      onChange={onChange}
      options={typeOptions}
      error={error}
      required
      helpText={
        isProfesseur
          ? "Les professeurs ne peuvent créer que des annonces de classe, événement ou urgentes"
          : "Sélectionnez le type d'annonce approprié"
      }
    />
  );
}