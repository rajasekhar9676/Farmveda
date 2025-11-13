import { NextRequest, NextResponse } from 'next/server';
import { readOrders } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await readOrders();

    // Prepare data for Excel
    const excelData = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Customer Name': order.customerName,
      'Mobile': order.customerMobile,
      'Community/Apartment': order.customerAddress.communityName || order.customerAddress.apartmentName || '',
      'Room No': order.customerAddress.roomNo || '',
      'Items': order.items.map(item => `${item.productName} (${item.quantity} ${item.unit})`).join(', '),
      'Total Amount': order.totalAmount,
      'Status': order.status,
      'Delivery Date': order.deliveryDate,
      'Order Date': order.createdAt,
      'Paid At': order.paidAt || '',
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as download
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="farmveda-orders-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

