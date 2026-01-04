'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store/authStore';
import { ROLE_ROUTES } from '@/lib/utils/constants';
import { RefreshCw } from 'lucide-react';

/**
 * Page d'accueil - Redirige automatiquement selon le rôle
 */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role?.name) {
      // Rediriger vers le dashboard approprié
      const redirectTo = ROLE_ROUTES[user.role.name] || '/login';
      router.replace(redirectTo);
    } else {
      // Pas authentifié, rediriger vers login
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}