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

    console.log('📧 [PAYMENT CALLBACK] Received callback with params:', {
      orderId,
      paymentId,
      paymentLinkId,
      paymentLinkReferenceId,
      paymentLinkStatus,
      hasSignature: !!signature,
    });

    // Use paymentLinkReferenceId (which is the order.id we set) or fallback to orderId
    const actualOrderId = paymentLinkReferenceId || orderId;

    if (!actualOrderId) {
      console.error('❌ [PAYMENT CALLBACK] No order ID found in callback');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=invalid_order`);
    }

    console.log(`🔍 [PAYMENT CALLBACK] Looking for order with ID: ${actualOrderId}`);
    const order = await findOrderById(actualOrderId);
    
    if (!order) {
      console.error(`❌ [PAYMENT CALLBACK] Order not found with ID: ${actualOrderId}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=order_not_found`);
    }

    console.log(`✅ [PAYMENT CALLBACK] Order found: ${order.orderNumber}, Status: ${order.status}`);

    // Check if payment is successful
    if (paymentLinkStatus === 'paid' || paymentId) {
      console.log('✅ [PAYMENT CALLBACK] Payment is successful, updating order status...');
      
      // Verify payment signature if available
      if (paymentId && signature && order.orderNumber) {
        const isValid = await verifyPayment(paymentId, order.orderNumber, signature);
        if (!isValid) {
          console.error('❌ [PAYMENT CALLBACK] Payment signature verification failed');
        } else {
          console.log('✅ [PAYMENT CALLBACK] Payment signature verified');
        }
      }

      // Only update if not already paid
      if (order.status !== 'paid') {
        await updateOrder(actualOrderId, {
          status: 'paid',
          paidAt: new Date().toISOString(),
        });
        console.log(`✅ [PAYMENT CALLBACK] Order status updated to 'paid'`);
      } else {
        console.log(`ℹ️ [PAYMENT CALLBACK] Order already marked as paid`);
      }

      // Get customer details and send invoice email
      console.log(`📧 [PAYMENT CALLBACK] Fetching customer details for order...`);
      const customer = await findUserById(order.customerId);
      
      if (!customer) {
        console.error(`❌ [PAYMENT CALLBACK] Customer not found for order ${order.id}`);
      } else if (!customer.email || customer.email.trim() === '') {
        console.error(`❌ [PAYMENT CALLBACK] Customer email is missing for order ${order.id}`);
        console.error(`❌ [PAYMENT CALLBACK] Customer: ${customer.name} (${customer.mobile})`);
      } else {
        console.log(`📧 [PAYMENT CALLBACK] Customer found: ${customer.name} (${customer.email})`);
        
        try {
          const invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/invoice/${order.id}`;
          
          console.log(`📧 [PAYMENT CALLBACK] Generating invoice email...`);
          const emailHtml = generateInvoiceEmail(
            order.orderNumber,
            order.customerName,
            order.totalAmount,
            invoiceUrl
          );

          console.log(`📧 [PAYMENT CALLBACK] Sending invoice email to: ${customer.email}`);
          const emailSent = await sendEmail({
            to: customer.email,
            subject: `Payment Confirmed - Invoice #${order.orderNumber} - FarmVeda`,
            html: emailHtml,
          });

          if (emailSent) {
            console.log(`✅ [PAYMENT CALLBACK] Invoice email sent successfully to ${customer.email}`);
          } else {
            console.error(`❌ [PAYMENT CALLBACK] Failed to send invoice email to ${customer.email}`);
          }
        } catch (emailError: any) {
          console.error(`❌ [PAYMENT CALLBACK] Error sending invoice email:`, emailError);
          console.error(`❌ [PAYMENT CALLBACK] Error details:`, emailError.message);
        }
      }

      // Redirect to orders page with success message
      const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?success=payment_completed`;
      console.log(`🔄 [PAYMENT CALLBACK] Redirecting to: ${redirectUrl}`);
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`❌ [PAYMENT CALLBACK] Payment failed or not completed`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders?error=payment_failed`);
    }
  } catch (error: any) {
    console.error('❌ [PAYMENT CALLBACK] Payment callback error:', error);
    console.error('❌ [PAYMENT CALLBACK] Error details:', error.message);
    console.error('❌ [PAYMENT CALLBACK] Stack:', error.stack);
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
      console.log('📧 [WEBHOOK] Received payment_link.paid event');
      const paymentLink = payload.payment_link.entity;
      const orderId = paymentLink.reference_id || paymentLink.id; // Use reference_id or fallback to payment link ID

      console.log(`📧 [WEBHOOK] Order ID from reference_id: ${orderId}`);

      if (orderId) {
        const order = await findOrderById(orderId);
        if (!order) {
          console.error(`❌ [WEBHOOK] Order not found with ID: ${orderId}`);
        } else if (order.status === 'paid') {
          console.log(`ℹ️ [WEBHOOK] Order ${order.orderNumber} already marked as paid`);
        } else {
          console.log(`✅ [WEBHOOK] Updating order ${order.orderNumber} to paid status`);
          // Update order status
          await updateOrder(orderId, {
            status: 'paid',
            paidAt: new Date().toISOString(),
          });

          // Send invoice email
          const customer = await findUserById(order.customerId);
          if (!customer) {
            console.error(`❌ [WEBHOOK] Customer not found for order ${order.id}`);
          } else if (!customer.email || customer.email.trim() === '') {
            console.error(`❌ [WEBHOOK] Customer email is missing for order ${order.id}`);
          } else {
            console.log(`📧 [WEBHOOK] Sending invoice email to: ${customer.email}`);
            try {
              const invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/invoice/${order.id}`;
              
              const emailHtml = generateInvoiceEmail(
                order.orderNumber,
                order.customerName,
                order.totalAmount,
                invoiceUrl
              );

              const emailSent = await sendEmail({
                to: customer.email,
                subject: `Payment Confirmed - Invoice #${order.orderNumber} - FarmVeda`,
                html: emailHtml,
              });

              if (emailSent) {
                console.log(`✅ [WEBHOOK] Invoice email sent successfully to ${customer.email}`);
              } else {
                console.error(`❌ [WEBHOOK] Failed to send invoice email to ${customer.email}`);
              }
            } catch (emailError: any) {
              console.error(`❌ [WEBHOOK] Error sending invoice email:`, emailError);
            }
          }
        }
      } else {
        console.error(`❌ [WEBHOOK] No order ID found in payment link reference_id`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

