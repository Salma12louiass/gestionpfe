// middleware.js
import { NextResponse } from 'next/server';

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  '/login', 
  '/register', 
  '/api/auth/login', 
  '/api/auth/register'
];

// Vérifier si un chemin correspond à une route statique ou publique
function isPublicPath(path) {
  // Vérifier les routes publiques définies
  if (publicRoutes.some(route => path.startsWith(route))) {
    return true;
  }
  
  // Vérifier les ressources statiques
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api/') ||
    path.startsWith('/images/') ||
    path.includes('.') // fichiers avec extension comme favicon.ico, etc.
  ) {
    return true;
  }
  
  return false;
}

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route publique ou statique
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Vérifier si le token est présent dans les cookies
  const token = request.cookies.get('token')?.value;
  
  // Si pas de token, rediriger vers la page de connexion
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirectTo=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  
  // Autoriser l'accès à la page
  return NextResponse.next();
}

// Configuration du middleware - matcher les chemins pertinents
export const config = {
  matcher: [
    // Matcher toutes les routes sauf celles qui sont explicitement ignorées
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};