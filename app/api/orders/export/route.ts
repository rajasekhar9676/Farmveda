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

    const { searchParams } = new URL(request.url);
    const deliveryDate = searchParams.get('deliveryDate');
    const groupByDate = searchParams.get('groupByDate') === 'true';

    let orders = await readOrders();

    // Filter by delivery date if provided
    if (deliveryDate) {
      orders = orders.filter(o => o.deliveryDate === deliveryDate);
    }

    const workbook = XLSX.utils.book_new();

    if (groupByDate) {
      // Group orders by delivery date
      const ordersByDate: Record<string, typeof orders> = {};
      orders.forEach(order => {
        const date = order.deliveryDate;
        if (!ordersByDate[date]) {
          ordersByDate[date] = [];
        }
        ordersByDate[date].push(order);
      });

      // Create a sheet for each delivery date
      Object.keys(ordersByDate).sort().forEach(date => {
        const dateOrders = ordersByDate[date];
        
        // Summary sheet for this date
        const productSummary: Record<string, {
          productName: string;
          unit: string;
          totalQuantity: number;
          totalAmount: number;
          orderCount: number;
        }> = {};

        dateOrders.forEach(order => {
          order.items.forEach((item: any) => {
            const key = `${item.productId}-${item.unit}`;
            if (!productSummary[key]) {
              productSummary[key] = {
                productName: item.productName,
                unit: item.unit,
                totalQuantity: 0,
                totalAmount: 0,
                orderCount: 0,
              };
            }
            productSummary[key].totalQuantity += item.quantity;
            productSummary[key].totalAmount += item.total;
            productSummary[key].orderCount++;
          });
        });

        // Summary data
        const summaryData = [
          { 'Product Name': 'SUMMARY', 'Unit': '', 'Total Quantity': '', 'Total Amount': '', 'Order Count': '' },
          ...Object.values(productSummary).map(p => ({
            'Product Name': p.productName,
            'Unit': p.unit,
            'Total Quantity': p.totalQuantity,
            'Total Amount': p.totalAmount,
            'Order Count': p.orderCount,
          })),
          { 'Product Name': '', 'Unit': '', 'Total Quantity': '', 'Total Amount': '', 'Order Count': '' },
          { 'Product Name': 'TOTAL ORDERS', 'Unit': '', 'Total Quantity': dateOrders.length, 'Total Amount': dateOrders.reduce((sum, o) => sum + o.totalAmount, 0), 'Order Count': '' },
        ];

        // Detailed orders for this date
        const ordersData = dateOrders.map(order => ({
          'Order Number': order.orderNumber,
          'Customer Name': order.customerName,
          'Mobile': order.customerMobile,
          'Community/Apartment': order.customerAddress.communityName || order.customerAddress.apartmentName || '',
          'Room No': order.customerAddress.roomNo || '',
          'Items': order.items.map((item: any) => `${item.productName} (${item.quantity} ${item.unit})`).join(', '),
          'Total Amount': order.totalAmount,
          'Status': order.status,
          'Order Date': order.createdAt,
          'Paid At': order.paidAt || '',
        }));

        // Create summary worksheet
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, `Summary-${date}`);

        // Create orders worksheet
        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, `Orders-${date}`);
      });
    } else {
      // Original format - all orders in one sheet
      const excelData = orders.map(order => ({
        'Order Number': order.orderNumber,
        'Customer Name': order.customerName,
        'Mobile': order.customerMobile,
        'Community/Apartment': order.customerAddress.communityName || order.customerAddress.apartmentName || '',
        'Room No': order.customerAddress.roomNo || '',
        'Items': order.items.map((item: any) => `${item.productName} (${item.quantity} ${item.unit})`).join(', '),
        'Total Amount': order.totalAmount,
        'Status': order.status,
        'Delivery Date': order.deliveryDate,
        'Order Date': order.createdAt,
        'Paid At': order.paidAt || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    }

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as download
    const filename = deliveryDate 
      ? `farmveda-orders-${deliveryDate}.xlsx`
      : `farmveda-orders-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

