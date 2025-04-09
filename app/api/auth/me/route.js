// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Secret pour le JWT (à placer dans un fichier .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key-a-changer-en-production';

export async function GET() {
  try {
    // Récupérer le token des cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer les informations complètes de l'utilisateur
    const response = await fetch(`http://localhost:5000/api/users/${decoded.id}?role=${decoded.role}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      user: {
        ...userData,
        id: decoded.id,
        role: decoded.role,
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}