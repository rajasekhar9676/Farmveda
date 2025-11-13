'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { ArrowLeft, Check, X, Copy, Send } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const foundOrder = data.orders.find((o: Order) => o.id === orderId);
        setOrder(foundOrder || null);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await loadOrder();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const copyPaymentLink = () => {
    if (order?.paymentLink) {
      navigator.clipboard.writeText(order.paymentLink);
      alert('Payment link copied to clipboard!');
    }
  };

  const sendPaymentLink = () => {
    if (order?.paymentLink && order?.customerMobile) {
      // Create WhatsApp message link
      const message = `Hello ${order.customerName}, your order ${order.orderNumber} has been delivered. Please make payment using this link: ${order.paymentLink}`;
      const whatsappUrl = `https://wa.me/${order.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const sendInvoice = () => {
    if (order?.customerMobile) {
      const invoiceUrl = `${window.location.origin}/api/invoice/${order.id}`;
      const message = `Hello ${order.customerName}, your invoice for order ${order.orderNumber} is ready. Download here: ${invoiceUrl}`;
      const whatsappUrl = `https://wa.me/${order.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#3a8735] text-xl">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Logo />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              order.status === 'paid' ? 'bg-[#3a8735] text-white' :
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Customer Details</h3>
              <p className="text-gray-800">{order.customerName}</p>
              <p className="text-gray-600">{order.customerMobile}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Delivery Address</h3>
              <p className="text-gray-800">{order.customerAddress.communityName}</p>
              <p className="text-gray-600">{order.customerAddress.apartmentName}</p>
              <p className="text-gray-600">Room No: {order.customerAddress.roomNo}</p>
              {order.customerAddress.street && (
                <p className="text-gray-600">{order.customerAddress.street}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-4 border-t-2">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-[#3a8735]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Order Actions</h3>
            <div className="flex flex-wrap gap-3">
              {order.status === 'pending' && (
                <Button onClick={() => updateOrderStatus('confirmed')} disabled={updating}>
                  <Check className="w-4 h-4 mr-2 inline" />
                  Confirm Order
                </Button>
              )}

              {['pending', 'confirmed'].includes(order.status) && (
                <Button onClick={() => updateOrderStatus('out_for_delivery')} disabled={updating}>
                  Mark Out for Delivery
                </Button>
              )}

              {['pending', 'confirmed', 'out_for_delivery'].includes(order.status) && (
                <Button onClick={() => updateOrderStatus('delivered')} disabled={updating}>
                  <Check className="w-4 h-4 mr-2 inline" />
                  Mark as Delivered
                </Button>
              )}

              {order.status === 'delivered' && order.paymentLink && (
                <>
                  <Button variant="outline" onClick={copyPaymentLink}>
                    <Copy className="w-4 h-4 mr-2 inline" />
                    Copy Payment Link
                  </Button>
                  <Button variant="outline" onClick={sendPaymentLink}>
                    <Send className="w-4 h-4 mr-2 inline" />
                    Send via WhatsApp
                  </Button>
                </>
              )}

              {order.status === 'paid' && (
                <Button variant="outline" onClick={sendInvoice}>
                  <Send className="w-4 h-4 mr-2 inline" />
                  Send Invoice via WhatsApp
                </Button>
              )}

              {order.status === 'delivered' && (
                <Button onClick={() => updateOrderStatus('paid')} disabled={updating}>
                  Mark as Paid
                </Button>
              )}
            </div>

            {order.status === 'delivered' && order.paymentLink && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Payment Link Generated</h4>
                <p className="text-sm text-green-700 mb-2 break-all">{order.paymentLink}</p>
                {order.paymentQRCode && (
                  <div className="mt-4">
                    <p className="text-sm text-green-700 mb-2">Payment QR Code:</p>
                    <img src={order.paymentQRCode} alt="Payment QR" className="w-48 h-48 mx-auto" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


