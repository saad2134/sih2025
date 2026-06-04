import { NextResponse } from 'next/server';

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  const isConfigured = !!(googleClientId && googleClientSecret && nextAuthSecret && 
    googleClientId.trim() !== '' && 
    googleClientSecret.trim() !== '' && 
    nextAuthSecret.trim() !== '' && 
    nextAuthSecret !== 'your-nextauth-secret-key-here');

  return NextResponse.json({ googleLoginAvailable: isConfigured });
}
