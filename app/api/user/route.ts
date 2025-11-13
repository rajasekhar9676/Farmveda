import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      console.log('No auth user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await findUserById(auth.userId);

    if (!user) {
      console.log('User not found for ID:', auth.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

