'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { ArrowLeft, Download, FileText, Package } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Order } from '@/lib/types';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    if (searchParams?.get('success') === 'true') {
      alert('Order placed successfully!');
    }
  }, [searchParams]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Filter orders for current customer only
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId: string) => {
    try {
      const res = await fetch(`/api/invoice/${orderId}`, { credentials: 'include' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      paid: 'bg-[#3a8735] text-white border-[#2d6a29]',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <nav className="bg-white shadow-sm border-b w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Logo />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">My Orders</h1>
          <p className="text-lg text-gray-600">View all your orders and track their status</p>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-[#3a8735] text-xl font-semibold">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No orders yet.</p>
            <p className="text-gray-500 text-sm mb-6">Start shopping to see your orders here.</p>
            <Button onClick={() => router.push('/catalog')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Order #{order.orderNumber}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Placed on:</span> {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Delivery Date:</span> {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-5 py-2.5 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-semibold text-gray-900">{item.productName}</span>
                          <span className="text-gray-600 ml-2">- {item.quantity} {item.unit}</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200">
                    <span className="text-xl font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-extrabold text-[#3a8735]">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                {order.status === 'delivered' && order.paymentLink && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-green-900 mb-3">Payment Information</h4>
                    <p className="text-sm text-green-800 mb-3">
                      Please make payment using the link below:
                    </p>
                    <a 
                      href={order.paymentLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#3a8735] hover:text-[#2d6a29] font-medium underline break-all"
                    >
                      {order.paymentLink}
                    </a>
                    {order.paymentQRCode && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-green-800 mb-2">Or scan this QR code:</p>
                        <img src={order.paymentQRCode} alt="Payment QR Code" className="w-40 h-40 mx-auto border-2 border-green-300 rounded-lg" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  {order.status === 'paid' && (
                    <Button
                      variant="outline"
                      onClick={() => downloadInvoice(order.id)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download Invoice
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Orders() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#3a8735] text-xl">Loading...</div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
