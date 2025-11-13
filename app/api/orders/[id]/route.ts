import { NextRequest, NextResponse } from 'next/server';
import { findOrderById, updateOrder } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import QRCode from 'qrcode';

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
    const { status } = await request.json();
    const order = await findOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updates: any = { status };

    // When order is delivered, generate payment link and QR code
    if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
      
      // Generate payment link (you can customize this URL)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const paymentLink = `${baseUrl}/payment/${order.id}`;
      updates.paymentLink = paymentLink;

      // Generate QR code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(paymentLink);
        updates.paymentQRCode = qrCodeDataUrl;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    // When payment is completed
    if (status === 'paid') {
      updates.paidAt = new Date().toISOString();
    }

    const updatedOrder = await updateOrder(id, updates);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

