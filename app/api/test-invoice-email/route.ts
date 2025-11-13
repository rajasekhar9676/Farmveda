import { NextRequest, NextResponse } from 'next/server';
import { findOrderById, findOrderByOrderNumber, findUserById } from '@/lib/db';
import { sendEmail, generateInvoiceEmail } from '@/lib/email';

/**
 * Test endpoint to send invoice email locally
 * Usage: 
 * - GET /api/test-invoice-email?orderId=ORDER_ID (MongoDB ObjectId)
 * - GET /api/test-invoice-email?orderId=ORDER_NUMBER (e.g., FV-1763061971840-392)
 * This allows you to test invoice email sending without completing payment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { 
          error: 'Order ID or Order Number is required',
          usage: [
            'GET /api/test-invoice-email?orderId=ORDER_ID (MongoDB ObjectId)',
            'GET /api/test-invoice-email?orderId=ORDER_NUMBER (e.g., FV-1763061971840-392)'
          ]
        },
        { status: 400 }
      );
    }

    console.log(`🧪 [TEST] Testing invoice email for: ${orderId}`);

    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    // ObjectId format: 24 hexadecimal characters (0-9, a-f)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    
    let order = null;
    
    if (isValidObjectId) {
      // Try to find by MongoDB ObjectId first
      console.log(`🔍 [TEST] Looks like ObjectId, searching by ID...`);
      try {
        order = await findOrderById(orderId);
      } catch (error: any) {
        console.log(`⚠️ [TEST] Error finding by ID: ${error.message}`);
        // Continue to try order number
      }
    }
    
    // If not found by ID or not a valid ObjectId, try order number
    if (!order) {
      console.log(`🔍 [TEST] Searching by order number...`);
      order = await findOrderByOrderNumber(orderId);
    }

    if (!order) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          hint: 'Make sure you\'re using either the Order ID (MongoDB ObjectId) or Order Number (e.g., FV-1763061971840-392)'
        },
        { status: 404 }
      );
    }

    console.log(`✅ [TEST] Order found: ${order.orderNumber}`);

    const customer = await findUserById(order.customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (!customer.email || customer.email.trim() === '') {
      return NextResponse.json(
        { error: 'Customer email is missing' },
        { status: 400 }
      );
    }

    console.log(`📧 [TEST] Customer: ${customer.name} (${customer.email})`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invoiceUrl = `${baseUrl}/api/invoice/${order.id}`;

    console.log(`📧 [TEST] Generating invoice email...`);
    const emailHtml = generateInvoiceEmail(
      order.orderNumber,
      order.customerName,
      order.totalAmount,
      invoiceUrl
    );

    console.log(`📧 [TEST] Sending invoice email to: ${customer.email}`);
    const emailSent = await sendEmail({
      to: customer.email,
      subject: `Payment Confirmed - Invoice #${order.orderNumber} - FarmVeda`,
      html: emailHtml,
    });

    if (emailSent) {
      console.log(`✅ [TEST] Invoice email sent successfully!`);
      return NextResponse.json({
        success: true,
        message: 'Invoice email sent successfully',
        orderNumber: order.orderNumber,
        customerEmail: customer.email,
        invoiceUrl: invoiceUrl,
      });
    } else {
      console.error(`❌ [TEST] Failed to send invoice email`);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send invoice email',
          orderNumber: order.orderNumber,
          customerEmail: customer.email,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ [TEST] Error testing invoice email:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

