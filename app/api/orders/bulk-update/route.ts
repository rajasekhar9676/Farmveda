import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { findOrderById, updateOrder } from '@/lib/db';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderIds, status } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

    for (const orderId of orderIds) {
      try {
        const order = await findOrderById(orderId);
        if (!order) continue;

        const updates: any = { status };

        // When order is delivered, generate payment link and QR code
        if (status === 'delivered') {
          updates.deliveredAt = new Date();
          const paymentLink = `${baseUrl}/payment/${order.id}`;
          updates.paymentLink = paymentLink;

          try {
            const qrCodeDataUrl = await QRCode.toDataURL(paymentLink);
            updates.paymentQRCode = qrCodeDataUrl;
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }

        // When payment is completed
        if (status === 'paid') {
          updates.paidAt = new Date();
        }

        await updateOrder(orderId, updates);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Successfully updated ${updatedCount} order(s)`,
    });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
