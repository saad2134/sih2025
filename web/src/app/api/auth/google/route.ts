import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Google authentication successful',
    user: {
      id: '1',
      name: 'Google User',
      email: 'user@gmail.com',
    },
    token: 'demo-token-' + Date.now(),
  });
}
