import { NextRequest, NextResponse } from 'next/server';
import { readDeliveries, createDelivery, findDeliveryByDate } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { DeliveryItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deliveryDate = searchParams.get('deliveryDate');
    const role = searchParams.get('role'); // 'admin' or 'customer'

    const deliveries = await readDeliveries();

    // Filter by date if provided
    let filteredDeliveries = deliveries;
    if (deliveryDate) {
      filteredDeliveries = filteredDeliveries.filter(d => d.deliveryDate === deliveryDate);
    }

    // For customers, only show active deliveries for today or future dates
    if (role === 'customer') {
      const today = new Date().toISOString().split('T')[0];
      filteredDeliveries = filteredDeliveries.filter(d => 
        d.status === 'active' && d.deliveryDate >= today
      );
    }

    return NextResponse.json({ deliveries: filteredDeliveries });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
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

    const { deliveryDate, products } = await request.json();

    if (!deliveryDate) {
      return NextResponse.json(
        { error: 'Delivery date is required' },
        { status: 400 }
      );
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'At least one product is required' },
        { status: 400 }
      );
    }

    // Check if delivery already exists for this date
    const existing = await findDeliveryByDate(deliveryDate);
    if (existing) {
      return NextResponse.json(
        { error: 'A delivery already exists for this date. Please update the existing delivery instead.' },
        { status: 400 }
      );
    }

    // Validate products
    const deliveryProducts: DeliveryItem[] = products.map((p: any) => ({
      productId: p.productId,
      productName: p.productName,
      price: Number(p.price),
      quantity: Number(p.quantity),
      unit: p.unit,
      description: p.description || '',
      image: p.image || '',
    }));

    const newDelivery = await createDelivery({
      deliveryDate,
      products: deliveryProducts,
      status: 'active',
    });

    return NextResponse.json({ success: true, delivery: newDelivery });
  } catch (error: any) {
    console.error('Error creating delivery:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

