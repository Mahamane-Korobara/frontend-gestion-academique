'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, FileText, Clock, ClipboardList, 
  ClipboardCheck, MessageSquare 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Imports pour le Modal (Identiques à UtilisateursPage)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay, 
} from "@/components/ui/dialog";
import UserForm from '@/components/forms/UserForm';

// Hooks (Identiques à UtilisateursPage)
import useUsers from '@/lib/hooks/useUsers';
import useFilieres from '@/lib/hooks/useFilieres';
import useNiveaux from '@/lib/hooks/useNiveaux';
import { useModalOperations } from '@/lib/hooks/useModalOperations';
import useModal from '@/lib/hooks/useModal';

export default function DynamicQuickActions({ role = 'admin' }) {
  // 1. Hooks pour la gestion des données et opérations
  const createModal = useModal();
  const { createUser } = useUsers();
  const { activeFilieresOptions } = useFilieres();
  const { niveauxOptions, getNiveauxByFiliere } = useNiveaux();
  const { isSubmitting, handleCreate } = useModalOperations();

  // 2. Handler de création (identique à UtilisateursPage)
  const onCreateUser = (formData) => {
    return handleCreate(
      createUser,
      formData,
      createModal,
      'Utilisateur créé avec succès'
    );
  };

  // 3. Configuration des actions par rôle
  const ROLE_CONFIGS = {
    admin: {
      title: 'Actions Administratives',
      badge: 'ADMIN',
      actions: [
        { 
          label: 'Nouvel Utilisateur', 
          icon: Plus, 
          onClick: createModal.open, // Déclenche le modal
          color: 'bg-blue-50 text-blue-600 border-blue-100' 
        },
        { label: 'Générer Bulletins', icon: FileText, href: '/admin/bulletins', color: 'bg-green-50 text-green-600 border-green-100' },
        { label: 'Emploi du Temps', icon: Clock, href: '/admin/emploi-du-temps', color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: 'Gérer Annonces', icon: ClipboardList, href: '/annonces', color: 'bg-orange-50 text-orange-600 border-orange-100' },
      ]
    },
    professeur: {
      title: 'Actions Enseignant',
      badge: 'PROFS',
      actions: [
        { label: 'Nouvelle Annonce', icon: Plus, href: '/professeur/annonces/nouveau', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Saisir des Notes', icon: ClipboardCheck, href: '/professeur/notes', color: 'bg-green-50 text-green-600 border-green-100' },
        { label: 'Envoyer Message', icon: MessageSquare, href: '/professeur/messages', color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: 'Partager Document', icon: FileText, href: '/professeur/documents', color: 'bg-orange-50 text-orange-600 border-orange-100' },
      ]
    }
  };

  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.admin;

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            {config.title}
          </h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            {config.badge}
          </span>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {config.actions.map((action, idx) => {
              const Icon = action.icon;
              
              // Design interne commun
              const innerContent = (
                <div className="h-full p-5 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-md active:scale-95 cursor-pointer group">
                  <div className={`w-14 h-14 rounded-xl ${action.color} border flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {action.label}
                  </span>
                </div>
              );

              // Rendu conditionnel : Bouton pour Modal OU Lien pour Navigation
              return action.onClick ? (
                <button key={idx} onClick={action.onClick} className="p-0 border-none bg-transparent outline-none">
                  {innerContent}
                </button>
              ) : (
                <Link key={idx} href={action.href}>
                  {innerContent}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE CRÉATION 
      */}
      <Dialog open={createModal.isOpen} onOpenChange={createModal.close}>
        <DialogOverlay className="backdrop-blur-sm" /> 
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl border-none shadow-2xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold text-gray-800">
              Créer un nouvel utilisateur
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Remplissez les informations ci-dessous pour créer un nouveau compte.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <UserForm
              filieres={activeFilieresOptions}
              niveauxOptions={niveauxOptions}
              getNiveauxByFiliere={getNiveauxByFiliere}
              onSubmit={onCreateUser}
              onCancel={createModal.close}
              loading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}