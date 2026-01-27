import { NextResponse } from 'next/server';

/**
 * Middleware qui s'exécute AVANT chaque requête
 * Protège les routes selon le rôle utilisateur
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Récupérer le token depuis les cookies ou headers
    const token = request.cookies.get('token')?.value;

    // Routes publiques (pas besoin d'auth)
    const publicRoutes = ['/login', '/'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Si pas de token et route privée → Rediriger vers login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si token et sur /login → Rediriger vers dashboard
    if (token && pathname === '/login') {
        // Note: On ne peut pas lire le localStorage ici (middleware server-side)
        // On redirige vers la page d'accueil qui fera le routing
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Protection par rôle (basique, car on ne peut pas décoder le JWT facilement ici)
    // La vraie vérification se fait côté client avec useAuth

    return NextResponse.next();
}

/**
 * Configuration du middleware
 * Définit sur quelles routes il s'applique
 */
export const config = {
    matcher: [
        /*
         * Match toutes les routes sauf :
         * - /api (API routes)
         * - /_next/static (fichiers statiques)
         * - /_next/image (images optimisées)
         * - /favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};