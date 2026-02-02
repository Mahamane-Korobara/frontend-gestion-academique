'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';

export default function ProfesseurLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, hasRole, user, isHydrated } = useAuth();

  useEffect(() => {
    // On attend que l'auth soit chargée pour décider
    if (!isHydrated) return;

    // Si pas connecté -> login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Sécurité : Si n'est pas professeur, on redirige vers son espace légitime
    if (user && !hasRole('professeur')) {
      const userRole = user.role?.name;
      if (userRole === 'admin') router.replace('/admin/dashboard');
      else if (userRole === 'etudiant') router.replace('/etudiant/dashboard');
      else router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, user, hasRole, router]);

  // Empêche le "flash" de contenu avant la vérification
  if (!isHydrated) return null;
  if (!isAuthenticated || !hasRole('professeur')) return null;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Desktop (La logique de visibilité est normalement gérée dans le composant Sidebar) */}
      <Sidebar />

      {/* Sidebar Mobile */}
      <MobileSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Ajout du bg-gray-50 et overflow-auto pour matcher l'admin */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}