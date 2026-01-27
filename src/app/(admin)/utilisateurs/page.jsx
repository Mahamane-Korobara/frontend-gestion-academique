'use client';

import Header from '@/components/layout/Header';

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <Header 
        title="Gestion des utilisateurs" 
        description="Gérez les comptes étudiants, professeurs et administrateurs. Ajoutez, modifiez ou désactivez des accès en toute sécurité."
      />
      {/* Contenu de la page */}
    </div>
  );
}