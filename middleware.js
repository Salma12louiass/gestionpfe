// middleware.js
import { NextResponse } from 'next/server';

// Routes publiques (accessibles sans authentification)
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route publique
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Vérifier si le token est présent dans les cookies
  const token = request.cookies.get('token')?.value;
  
  // Si pas de token, rediriger vers la page de connexion
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Autoriser l'accès à la page
  return NextResponse.next();
}

// Configuration du middleware - spécifier les chemins à protéger
export const config = {
  matcher: [
    /*
     * Exclure les routes suivantes :
     * - Api routes (/api/*)
     * - Static files (/_next/*)
     * - Images (/images/*)
     * - Resources (e.g. /favicon.ico)
     */
    '/((?!api|_next|images|[\\w-]+\\.\\w+).*)',
  ],
};