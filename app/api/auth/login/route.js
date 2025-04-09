// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Secret pour le JWT (à placer dans un fichier .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Générer un token JWT
    const token = jwt.sign(
      {
        id: data.user.id,
        role: data.user.role,
        email: data.user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retourner les informations de l'utilisateur et le token
    return NextResponse.json({
      user: data.user,
      token,
    });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'authentification' },
      { status: 500 }
    );
  }
}