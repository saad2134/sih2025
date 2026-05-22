import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_SERVICE_CORE_BASE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
          { success: false, message: userData.detail || 'Invalid credentials' },
          { status: 401 }
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
