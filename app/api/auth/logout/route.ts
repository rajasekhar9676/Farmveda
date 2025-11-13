import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', 'auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  return response;
}

