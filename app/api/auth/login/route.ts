import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByMobile } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { mobile, password } = await request.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { error: 'Mobile and password are required' },
        { status: 400 }
      );
    }

    const user = await findUserByMobile(mobile);

    if (!user) {
      console.log('Login attempt - User not found for mobile:', mobile);
      return NextResponse.json(
        { error: 'Invalid mobile or password' },
        { status: 401 }
      );
    }

    console.log('User found:', user.name, 'Role:', user.role);
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('Login attempt - Invalid password for mobile:', mobile);
      return NextResponse.json(
        { error: 'Invalid mobile or password' },
        { status: 401 }
      );
    }
    
    console.log('Login successful for:', user.name);

    const token = generateToken({ id: user.id, role: user.role });
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
      token: token, // Also send token in response for client-side storage
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

