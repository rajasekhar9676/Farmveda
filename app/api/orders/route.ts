import { NextRequest, NextResponse } from 'next/server';
import { readOrders, createOrder, readProducts, findUserById, findProductById, updateProduct } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { OrderItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deliveryDate = searchParams.get('deliveryDate');
    const aggregate = searchParams.get('aggregate') === 'true';

    const orders = await readOrders();

    // If customer, only show their orders
    if (auth.role === 'customer') {
      let customerOrders = orders.filter(o => o.customerId === auth.userId);
      
      // Filter by delivery date if provided
      if (deliveryDate) {
        customerOrders = customerOrders.filter(o => o.deliveryDate === deliveryDate);
      }
      
      return NextResponse.json({ orders: customerOrders });
    }

    // Admin sees all orders
    let filteredOrders = orders;
    
    // Filter by delivery date if provided
    if (deliveryDate) {
      filteredOrders = filteredOrders.filter(o => o.deliveryDate === deliveryDate);
    }

    // If aggregate is requested, return aggregated data
    if (aggregate) {
      const aggregated = aggregateOrdersByDate(filteredOrders);
      return NextResponse.json({ aggregated, orders: filteredOrders });
    }

    return NextResponse.json({ orders: filteredOrders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to aggregate orders by delivery date and product
function aggregateOrdersByDate(orders: any[]) {
  const byDate: Record<string, {
    date: string;
    totalOrders: number;
    totalAmount: number;
    products: Record<string, {
      productName: string;
      unit: string;
      totalQuantity: number;
      totalAmount: number;
      orderCount: number;
    }>;
    customers: Set<string>;
  }> = {};

  orders.forEach(order => {
    const date = order.deliveryDate;
    if (!byDate[date]) {
      byDate[date] = {
        date,
        totalOrders: 0,
        totalAmount: 0,
        products: {},
        customers: new Set(),
      };
    }

    byDate[date].totalOrders++;
    byDate[date].totalAmount += order.totalAmount;
    byDate[date].customers.add(order.customerId);

    order.items.forEach((item: any) => {
      const key = `${item.productId}-${item.unit}`;
      if (!byDate[date].products[key]) {
        byDate[date].products[key] = {
          productName: item.productName,
          unit: item.unit,
          totalQuantity: 0,
          totalAmount: 0,
          orderCount: 0,
        };
      }
      byDate[date].products[key].totalQuantity += item.quantity;
      byDate[date].products[key].totalAmount += item.total;
      byDate[date].products[key].orderCount++;
    });
  });

  // Convert to array and format
  return Object.values(byDate).map(group => ({
    ...group,
    uniqueCustomers: group.customers.size,
    products: Object.values(group.products),
  }));
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { items, deliveryDate, address } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!deliveryDate) {
      return NextResponse.json(
        { error: 'Delivery date is required' },
        { status: 400 }
      );
    }

    const user = await findUserById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from placing orders as customer
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin users cannot place orders. Please use a customer account.' },
        { status: 403 }
      );
    }

    // Ensure customer has email
    if (!user.email || user.email.trim() === '') {
      return NextResponse.json(
        { error: 'Email address is required. Please update your profile with an email address.' },
        { status: 400 }
      );
    }

    // Check if this is a delivery-based order
    const { findDeliveryByDate } = await import('@/lib/db');
    const delivery = await findDeliveryByDate(deliveryDate);
    
    // Validate and calculate order items
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      let productPrice = 0;
      let productName = '';
      let productUnit: 'kilo' | 'pieces' | 'boxes' = 'kilo';
      let availableQuantity = 0;

      // If delivery exists, use delivery product data
      if (delivery) {
        const deliveryProduct = delivery.products.find(p => p.productId === item.productId);
        if (!deliveryProduct) {
          return NextResponse.json(
            { error: `Product not available in this delivery` },
            { status: 400 }
          );
        }
        productPrice = deliveryProduct.price;
        productName = deliveryProduct.productName;
        productUnit = deliveryProduct.unit;
        availableQuantity = deliveryProduct.quantity;
      } else {
        // Fallback to product catalog
        const product = await findProductById(item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 400 }
          );
        }
        productPrice = product.price;
        productName = product.name;
        productUnit = product.unit;
        availableQuantity = product.quantity;
      }

      // Note: Quantity validation removed - customers can order any quantity
      // The quantity field in products/deliveries is for reference/pricing only

      const itemTotal = productPrice * item.quantity;
      orderItems.push({
        productId: item.productId,
        productName: productName,
        quantity: item.quantity,
        unit: productUnit,
        price: productPrice,
        total: itemTotal,
      });

      totalAmount += itemTotal;

      // Note: We don't update product quantity here as deliveries manage their own quantities
      // The delivery quantity should be managed separately if needed
    }

    const newOrder = await createOrder({
      orderNumber: generateOrderNumber(),
      customerId: user.id,
      customerName: user.name,
      customerMobile: user.mobile,
      customerAddress: address || user.address || {
        communityName: '',
        apartmentName: '',
        roomNo: '',
      },
      items: orderItems,
      totalAmount,
      status: 'pending',
      deliveryDate,
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

