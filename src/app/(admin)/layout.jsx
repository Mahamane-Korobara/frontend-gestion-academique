// src/app/(admin)/layout.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, hasRole, user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && !hasRole('admin')) {
      const userRole = user.role?.name;
      if (userRole === 'professeur') router.replace('/professeur/dashboard');
      else if (userRole === 'etudiant') router.replace('/etudiant/dashboard');
      else router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, user, hasRole, router]);

  if (!isHydrated) return null;
  if (!isAuthenticated || !hasRole('admin')) return null;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Desktop fixe */}
      <Sidebar />

      {/* Sidebar Mobile (Tiroir caché par défaut) */}
      <MobileSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}