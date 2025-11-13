'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { ArrowLeft, CheckCircle, Package, Truck, DollarSign } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showAggregated, setShowAggregated] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deliveryDateFilter) {
        params.append('deliveryDate', deliveryDateFilter);
      }
      if (showAggregated) {
        params.append('aggregate', 'true');
      }
      
      const url = `/api/orders${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.aggregated) {
          setAggregatedData(data.aggregated || []);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [deliveryDateFilter, showAggregated]);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedOrders.size === 0) {
      alert('Please select at least one order');
      return;
    }

    if (!confirm(`Are you sure you want to update ${selectedOrders.size} order(s) to ${status}?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      const res = await fetch('/api/orders/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Successfully updated ${data.updatedCount} order(s)`);
        setSelectedOrders(new Set());
        loadOrders();
      } else {
        alert(data.error || 'Failed to update orders');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (res.ok) {
        loadOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <button onClick={() => router.push('/admin/dashboard')} className="hover:opacity-70 transition-opacity p-2 -ml-2">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <Logo />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Orders</h1>
          <p className="text-sm text-gray-600">Manage and track all customer orders by delivery batches</p>
        </div>

        {/* Filter and Actions */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] text-base font-medium bg-white text-gray-900"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="paid">Paid</option>
              </select>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDateFilter}
                  onChange={(e) => setDeliveryDateFilter(e.target.value)}
                  className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] text-base font-medium bg-white text-gray-900"
                />
                {deliveryDateFilter && (
                  <button
                    onClick={() => setDeliveryDateFilter('')}
                    className="ml-2 text-sm text-[#3a8735] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAggregated"
                  checked={showAggregated}
                  onChange={(e) => setShowAggregated(e.target.checked)}
                  className="w-5 h-5 text-[#3a8735] border-gray-300 rounded focus:ring-[#3a8735]"
                />
                <label htmlFor="showAggregated" className="text-sm font-semibold text-gray-700">
                  Show Aggregated View
                </label>
              </div>

              <div className="text-sm text-gray-700 font-semibold">
                <span>{filteredOrders.length}</span> order(s) found
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (deliveryDateFilter) params.append('deliveryDate', deliveryDateFilter);
                  params.append('groupByDate', 'true');
                  window.open(`/api/orders/export?${params.toString()}`, '_blank');
                }}
                className="px-5 py-2.5 text-sm font-semibold"
              >
                Export Excel (Grouped)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (deliveryDateFilter) params.append('deliveryDate', deliveryDateFilter);
                  window.open(`/api/orders/export?${params.toString()}`, '_blank');
                }}
                className="px-5 py-2.5 text-sm font-semibold border-2"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="bg-gradient-to-r from-[#3a8735] to-[#4fa349] text-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-xl text-white">{selectedOrders.size} order(s) selected</p>
                  <p className="text-sm text-white/90 mt-1">Choose an action to apply to all selected orders</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <Button
                  onClick={() => handleBulkUpdate('confirmed')}
                  disabled={bulkLoading}
                  className="bg-white text-[#3a8735] hover:bg-gray-50 border-0 shadow-lg px-5 py-3 font-semibold"
                >
                  <CheckCircle className="w-5 h-5 mr-2 inline" />
                  Accept All
                </Button>
                <Button
                  onClick={() => handleBulkUpdate('out_for_delivery')}
                  disabled={bulkLoading}
                  className="bg-white text-[#3a8735] hover:bg-gray-50 border-0 shadow-lg px-5 py-3 font-semibold"
                >
                  <Truck className="w-5 h-5 mr-2 inline" />
                  Out for Delivery
                </Button>
                <Button
                  onClick={() => handleBulkUpdate('delivered')}
                  disabled={bulkLoading}
                  className="bg-white text-[#3a8735] hover:bg-gray-50 border-0 shadow-lg px-5 py-3 font-semibold"
                >
                  <Package className="w-5 h-5 mr-2 inline" />
                  Mark Delivered
                </Button>
                <Button
                  onClick={() => handleBulkUpdate('paid')}
                  disabled={bulkLoading}
                  className="bg-white text-[#3a8735] hover:bg-gray-50 border-0 shadow-lg px-5 py-3 font-semibold"
                >
                  <DollarSign className="w-5 h-5 mr-2 inline" />
                  Mark Paid
                </Button>
                <Button
                  onClick={() => setSelectedOrders(new Set())}
                  className="bg-white/20 text-white hover:bg-white/30 border-2 border-white/30 px-5 py-3 font-semibold"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Aggregated View */}
        {showAggregated && aggregatedData.length > 0 && (
          <div className="mb-8 space-y-6">
            {aggregatedData.map((group) => (
              <div key={group.date} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-[#3a8735] to-[#4fa349] text-white">
                  <h2 className="text-2xl font-bold mb-2">Delivery Date: {new Date(group.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                  <div className="flex gap-6 text-sm">
                    <span>Total Orders: <strong>{group.totalOrders}</strong></span>
                    <span>Unique Customers: <strong>{group.uniqueCustomers}</strong></span>
                    <span>Total Amount: <strong>₹{group.totalAmount.toFixed(2)}</strong></span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Product Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-6 text-sm font-bold text-gray-700 uppercase">Product</th>
                          <th className="text-left py-3 px-6 text-sm font-bold text-gray-700 uppercase">Unit</th>
                          <th className="text-left py-3 px-6 text-sm font-bold text-gray-700 uppercase">Total Quantity</th>
                          <th className="text-left py-3 px-6 text-sm font-bold text-gray-700 uppercase">Total Amount</th>
                          <th className="text-left py-3 px-6 text-sm font-bold text-gray-700 uppercase">Order Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {group.products.map((product: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-3 px-6 font-semibold text-gray-900">{product.productName}</td>
                            <td className="py-3 px-6 text-gray-600 capitalize">{product.unit}</td>
                            <td className="py-3 px-6 font-bold text-gray-900">{product.totalQuantity}</td>
                            <td className="py-3 px-6 font-bold text-[#3a8735]">₹{product.totalAmount.toFixed(2)}</td>
                            <td className="py-3 px-6 text-gray-600">{product.orderCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="text-[#3a8735] text-xl font-semibold">Loading orders...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No orders found.</p>
            <p className="text-gray-500 text-sm mt-2">Try changing the filter or check back later.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-5 px-8">
                      <input
                        type="checkbox"
                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={selectAll}
                        className="w-5 h-5 text-[#3a8735] border-gray-300 rounded focus:ring-[#3a8735] cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Order #</th>
                    <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Delivery Date</th>
                    <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-8">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-5 h-5 text-[#3a8735] border-gray-300 rounded focus:ring-[#3a8735] cursor-pointer"
                        />
                      </td>
                      <td className="py-5 px-8">
                        <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="py-5 px-8">
                        <div>
                          <div className="font-semibold text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500 mt-1">{order.customerMobile}</div>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="py-5 px-8">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold border-2 focus:outline-none focus:ring-2 bg-white ${getStatusColor(order.status)}`}
                        >
                          <option value="pending" className="bg-white text-gray-900">Pending</option>
                          <option value="confirmed" className="bg-white text-gray-900">Confirmed</option>
                          <option value="out_for_delivery" className="bg-white text-gray-900">Out for Delivery</option>
                          <option value="delivered" className="bg-white text-gray-900">Delivered</option>
                          <option value="paid" className="bg-white text-gray-900">Paid</option>
                        </select>
                      </td>
                      <td className="py-5 px-8 text-sm text-gray-600">{formatDate(order.deliveryDate)}</td>
                      <td className="py-5 px-8">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="text-sm px-4 py-2"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
