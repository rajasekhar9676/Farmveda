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

    const orders = await readOrders();

    // If customer, only show their orders
    if (auth.role === 'customer') {
      const customerOrders = orders.filter(o => o.customerId === auth.userId);
      return NextResponse.json({ orders: customerOrders });
    }

    // Admin sees all orders
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    // Validate and calculate order items
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await findProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient quantity for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        price: product.price,
        total: itemTotal,
      });

      totalAmount += itemTotal;

      // Update product quantity
      await updateProduct(product.id, {
        quantity: product.quantity - item.quantity,
      });
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

