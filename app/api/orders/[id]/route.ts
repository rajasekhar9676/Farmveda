import { NextRequest, NextResponse } from 'next/server';
import { findOrderById, updateOrder, findUserById } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import QRCode from 'qrcode';
import { createPaymentLink } from '@/lib/razorpay';
import { sendEmail, generatePaymentLinkEmail } from '@/lib/email';

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

    // When order is delivered, generate Razorpay payment link and send email
    if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
      
      try {
        // Get customer details
        console.log(`📧 [ORDER] Order ID: ${order.id}`);
        console.log(`📧 [ORDER] Order Customer ID: ${order.customerId}`);
        console.log(`📧 [ORDER] Order Customer Name: ${order.customerName}`);
        console.log(`📧 [ORDER] Order Customer Mobile: ${order.customerMobile}`);
        
        const customer = await findUserById(order.customerId);
        
        console.log(`📧 [ORDER] Found customer:`, {
          id: customer?.id,
          name: customer?.name,
          email: customer?.email,
          mobile: customer?.mobile,
          role: customer?.role,
        });
        
        // Check if customer email exists, if not, check if customer email was provided during registration
        if (!customer) {
          console.error(`❌ [ORDER] Customer not found with ID: ${order.customerId}`);
        } else if (!customer.email || customer.email === '') {
          console.error(`❌ [ORDER] Customer email is missing or empty`);
          console.error(`❌ [ORDER] Customer details:`, {
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            role: customer.role,
          });
        } else if (customer.role === 'admin') {
          console.error(`❌ [ORDER] ERROR: Customer ID points to admin user instead of customer!`);
          console.error(`❌ [ORDER] This order belongs to admin, not a customer.`);
        }
        
        // CRITICAL: Only send payment links to customers, never to admin
        if (customer && customer.role === 'admin') {
          console.error(`❌ [ORDER] CRITICAL ERROR: Order ${order.id} belongs to ADMIN user!`);
          console.error(`❌ [ORDER] Payment link should NOT be sent to admin`);
          console.error(`❌ [ORDER] Order Customer ID: ${order.customerId}`);
          console.error(`❌ [ORDER] Order Customer Name: ${order.customerName}`);
          console.error(`❌ [ORDER] This order was likely created incorrectly`);
          // Don't send email to admin - skip payment link generation
        } else if (customer && customer.email && customer.email.trim() !== '' && customer.role === 'customer') {
          // Create Razorpay payment link
          console.log(`✅ [ORDER] Customer is valid - creating payment link`);
          const paymentLinkData = await createPaymentLink({
            amount: order.totalAmount,
            currency: 'INR',
            description: `Payment for Order #${order.orderNumber}`,
            customer: {
              name: order.customerName,
              email: customer.email,
              contact: order.customerMobile,
            },
            notify: {
              email: true,
              sms: false,
            },
            reference_id: order.id, // Store order ID for webhook tracking
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/callback?orderId=${order.id}`,
            callback_method: 'get',
          });

          const paymentLink = paymentLinkData.short_url || paymentLinkData.url;
          updates.paymentLink = paymentLink;

          // Generate QR code
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(paymentLink);
            updates.paymentQRCode = qrCodeDataUrl;
          } catch (error) {
            console.error('Error generating QR code:', error);
          }

          // Send payment link email to CUSTOMER (not admin)
          console.log(`📧 [ORDER] Preparing to send payment link email to CUSTOMER: ${customer.email}`);
          const emailHtml = generatePaymentLinkEmail(
            order.orderNumber,
            order.customerName,
            order.totalAmount,
            paymentLink
          );

          const emailSent = await sendEmail({
            to: customer.email,
            subject: `Payment Request - Order #${order.orderNumber} - FarmVeda`,
            html: emailHtml,
          });

          if (emailSent) {
            console.log(`✅ [ORDER] Payment link email sent successfully to CUSTOMER: ${customer.email}`);
          } else {
            console.error(`❌ [ORDER] Failed to send payment link email to CUSTOMER: ${customer.email}`);
          }
        } else {
          if (!customer) {
            console.error(`❌ [ORDER] Customer not found for order ${order.id}`);
            console.error(`❌ [ORDER] Customer ID from order: ${order.customerId}`);
          } else if (!customer.email || customer.email.trim() === '') {
            console.error(`❌ [ORDER] Customer email is missing for order ${order.id}`);
            console.error(`❌ [ORDER] Customer: ${customer.name} (${customer.mobile})`);
            console.error(`❌ [ORDER] Customer needs to register with email address`);
            console.error(`❌ [ORDER] Payment link email will NOT be sent`);
          } else {
            console.error(`❌ [ORDER] Unknown error - customer found but conditions not met`);
            console.error(`❌ [ORDER] Customer role: ${customer.role}`);
            console.error(`❌ [ORDER] Customer email: ${customer.email}`);
          }
        }
      } catch (error: any) {
        console.error('Error creating payment link or sending email:', error);
        // Continue with order update even if payment link creation fails
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

