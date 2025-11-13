import { NextRequest, NextResponse } from 'next/server';
import { findOrderById } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import jsPDF from 'jspdf';
import { formatDate, formatCurrency } from '@/lib/utils';

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
    const order = await findOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If customer, only allow access to their own orders
    if (auth.role === 'customer' && order.customerId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Generate PDF invoice
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Header
    doc.setFillColor(58, 135, 53); // #3a8735
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FarmVeda', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Fresh Farm Products', margin, 35);

    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Invoice Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin - 30, yPos);

    yPos += 15;

    // Order Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Number: ${order.orderNumber}`, margin, yPos);
    yPos += 7;
    doc.text(`Invoice Date: ${formatDate(order.createdAt)}`, margin, yPos);
    yPos += 7;
    doc.text(`Delivery Date: ${formatDate(order.deliveryDate)}`, margin, yPos);

    yPos += 15;

    // Customer Details
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(order.customerName, margin, yPos);
    yPos += 7;
    doc.text(`Mobile: ${order.customerMobile}`, margin, yPos);
    yPos += 7;
    if (order.customerAddress.communityName) {
      doc.text(`Community: ${order.customerAddress.communityName}`, margin, yPos);
      yPos += 7;
    }
    if (order.customerAddress.apartmentName) {
      doc.text(`Apartment: ${order.customerAddress.apartmentName}`, margin, yPos);
      yPos += 7;
    }
    if (order.customerAddress.roomNo) {
      doc.text(`Room No: ${order.customerAddress.roomNo}`, margin, yPos);
      yPos += 7;
    }

    yPos += 10;

    // Items Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Item', margin + 5, yPos);
    doc.text('Qty', margin + 80, yPos);
    doc.text('Price', margin + 110, yPos);
    doc.text('Total', pageWidth - margin - 30, yPos, { align: 'right' });

    yPos += 10;

    // Items
    doc.setFont('helvetica', 'normal');
    order.items.forEach(item => {
      doc.text(item.productName, margin + 5, yPos);
      doc.text(`${item.quantity} ${item.unit}`, margin + 80, yPos);
      doc.text(formatCurrency(item.price), margin + 110, yPos);
      doc.text(formatCurrency(item.total), pageWidth - margin - 5, yPos, { align: 'right' });
      yPos += 7;
    });

    yPos += 5;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', pageWidth - margin - 50, yPos);
    doc.text(formatCurrency(order.totalAmount), pageWidth - margin - 5, yPos, { align: 'right' });

    yPos += 15;

    // Payment Status
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (order.status === 'paid' && order.paidAt) {
      doc.setTextColor(58, 135, 53);
      doc.text(`Payment Status: PAID (${formatDate(order.paidAt)})`, margin, yPos);
    } else {
      doc.setTextColor(200, 0, 0);
      doc.text('Payment Status: PENDING', margin, yPos);
    }

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 20;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

