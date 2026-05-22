import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_SERVICE_CORE_BASE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(10000),
      });

      if (!backendResponse.ok) {
        return NextResponse.json(
          { success: false, message: 'Cannot reach backend core service.' },
          { status: 503 }
        );
      }

      const userData = await backendResponse.json();

      if (!backendResponse.ok || !userData.success) {
        return NextResponse.json(
          { success: false, message: userData.detail || 'Registration failed' },
          { status: backendResponse.status }
        );
      }

      return NextResponse.json(userData);
    } catch (dbError) {
      console.error('Backend connection failed:', dbError);
      return NextResponse.json(
        { success: false, message: 'Cannot reach backend core service.' },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
