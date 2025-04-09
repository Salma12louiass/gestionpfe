// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Supprimer le cookie de token
  const cookieStore = cookies();
  cookieStore.delete('token');
  
  return NextResponse.json({ success: true });
}