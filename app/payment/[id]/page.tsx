'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { Order } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/payment/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        if (data.order.status === 'paid') {
          setPaid(true);
        }
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/payment/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setPaid(true);
        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#3a8735] text-xl">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-[#3a8735] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your payment has been recorded.</p>
          <Button onClick={() => router.push('/orders')}>
            View Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment for Order #{order.orderNumber}</h1>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Order Date</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Delivery Date</span>
              <span className="font-medium">{formatDate(order.deliveryDate)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Customer</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
          </div>

          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2">
                  <span className="text-gray-600">
                    {item.productName} ({item.quantity} {item.unit})
                  </span>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 pt-6 mb-6">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total Amount</span>
              <span className="text-[#3a8735]">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Please complete your payment using UPI, bank transfer, or cash on delivery.
              After payment, click the button below to confirm.
            </p>
          </div>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </div>
      </main>
    </div>
  );
}


