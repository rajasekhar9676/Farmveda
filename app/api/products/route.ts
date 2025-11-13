import { NextRequest, NextResponse } from 'next/server';
import { readProducts, createProduct } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const role = searchParams.get('role');

    let products = await readProducts();

    // If date is provided, filter by exact date match
    if (date) {
      products = products.filter(p => p.availableDate === date);
    }

    // If customer, only show products for today or future dates
    if (role === 'customer') {
      const today = new Date().toISOString().split('T')[0];
      products = products.filter(p => p.availableDate >= today);
    }

    // Sort by date (earliest first)
    products.sort((a, b) => a.availableDate.localeCompare(b.availableDate));

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, price, quantity, unit, availableDate, description, image } = await request.json();

    if (!name || !price || !quantity || !unit || !availableDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      availableDate,
      description: description || '',
      image: image || '',
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
