import { NextRequest, NextResponse } from 'next/server';
import { findOrderById, updateOrder, findUserById } from '@/lib/db';
import { verifyPayment } from '@/lib/razorpay';
import { sendEmail, generateInvoiceEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('razorpay_payment_id');
    const paymentLinkId = searchParams.get('razorpay_payment_link_id');
    const paymentLinkReferenceId = searchParams.get('razorpay_payment_link_reference_id');
    const paymentLinkStatus = searchParams.get('razorpay_payment_link_status');
    const signature = searchParams.get('razorpay_signature');

    if (!orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=invalid_order`);
    }

    const order = await findOrderById(orderId);
    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=order_not_found`);
    }

    // Check if payment is successful
    if (paymentLinkStatus === 'paid' || paymentId) {
      // Verify payment signature if available
      if (paymentId && signature && order.orderNumber) {
        const isValid = await verifyPayment(paymentId, order.orderNumber, signature);
        if (!isValid) {
          console.error('Payment signature verification failed');
        }
      }

      // Update order status to paid
      await updateOrder(orderId, {
        status: 'paid',
        paidAt: new Date().toISOString(),
      });

      // Get customer details and send invoice email
      const customer = await findUserById(order.customerId);
      if (customer && customer.email) {
        const invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/invoice/${order.id}`;
        
        const emailHtml = generateInvoiceEmail(
          order.orderNumber,
          order.customerName,
          order.totalAmount,
          invoiceUrl
        );

        await sendEmail({
          to: customer.email,
          subject: `Payment Confirmed - Invoice #${order.orderNumber} - FarmVeda`,
          html: emailHtml,
        });

        console.log(`Invoice email sent to ${customer.email}`);
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?success=payment_completed`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=payment_failed`);
    }
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=payment_error`);
  }
}

// Webhook endpoint for Razorpay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.event;
    const payload = body.payload;

    // Handle payment_link.paid event
    if (event === 'payment_link.paid') {
      const paymentLink = payload.payment_link.entity;
      const orderId = paymentLink.reference_id || paymentLink.id; // Use reference_id or fallback to payment link ID

      if (orderId) {
        const order = await findOrderById(orderId);
        if (order && order.status !== 'paid') {
          // Update order status
          await updateOrder(orderId, {
            status: 'paid',
            paidAt: new Date().toISOString(),
          });

          // Send invoice email
          const customer = await findUserById(order.customerId);
          if (customer && customer.email) {
            const invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/invoice/${order.id}`;
            
            const emailHtml = generateInvoiceEmail(
              order.orderNumber,
              order.customerName,
              order.totalAmount,
              invoiceUrl
            );

            await sendEmail({
              to: customer.email,
              subject: `Payment Confirmed - Invoice #${order.orderNumber} - FarmVeda`,
              html: emailHtml,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

