// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Vérifier que les champs requis sont présents
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Appel à votre API Backend pour vérifier les identifiants
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Définir le cookie avec le token JWT
    const cookieStore = cookies();
    cookieStore.set('token', data.token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 jour
      path: '/',
    });

    // Retourner les informations de l'utilisateur (sans le token qui est dans le cookie)
    return NextResponse.json({
      user: data.user
    });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'authentification' },
      { status: 500 }
    );
  }
}