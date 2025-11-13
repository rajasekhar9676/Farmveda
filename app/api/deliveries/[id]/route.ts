import { NextRequest, NextResponse } from 'next/server';
import { findDeliveryById, updateDelivery, deleteDelivery } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { DeliveryItem } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const delivery = await findDeliveryById(id);

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const updates = await request.json();

    // If products are being updated, validate them
    if (updates.products) {
      const deliveryProducts: DeliveryItem[] = updates.products.map((p: any) => ({
        productId: p.productId,
        productName: p.productName,
        price: Number(p.price),
        quantity: Number(p.quantity),
        unit: p.unit,
        description: p.description || '',
        image: p.image || '',
      }));
      updates.products = deliveryProducts;
    }

    const updated = await updateDelivery(id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, delivery: updated });
  } catch (error: any) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const deleted = await deleteDelivery(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

