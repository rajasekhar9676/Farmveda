'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { LogOut, Package, ShoppingCart, Download, Plus, TrendingUp, Clock } from 'lucide-react';
import { getAuthToken, removeAuthToken } from '@/lib/client-auth';
import { Order } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await fetch('/api/user', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role !== 'admin') {
          router.push('/admin/login');
          return;
        }
        setUser(data.user);
        loadOrders();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        
        const totalOrders = data.orders.length;
        const pendingOrders = data.orders.filter((o: Order) => 
          ['pending', 'confirmed', 'out_for_delivery'].includes(o.status)
        ).length;
        const deliveredOrders = data.orders.filter((o: Order) => 
          o.status === 'delivered' || o.status === 'paid'
        ).length;
        const totalRevenue = data.orders
          .filter((o: Order) => o.status === 'paid')
          .reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

        setStats({
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    removeAuthToken();
    router.push('/admin/login');
  };

  const exportExcel = async () => {
    try {
      const res = await fetch('/api/orders/export', { credentials: 'include' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farmveda-orders-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-[#3a8735] text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <Logo />
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
                <p className="text-base font-bold text-gray-900">{user?.name || 'Admin'}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="px-5 py-2.5 text-sm font-semibold border-2">
                <LogOut className="w-4 h-4 mr-2 inline" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 w-full">
        {/* Header Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 font-medium">Manage your orders, products, and business operations</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4" style={{ marginBottom: '3rem' }}>
          <Button 
            onClick={() => router.push('/admin/products')} 
            className="px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Product
          </Button>
          <Button 
            onClick={() => router.push('/admin/orders')} 
            variant="secondary" 
            className="px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <ShoppingCart className="w-5 h-5 mr-2 inline" />
            View All Orders
          </Button>
          <Button 
            variant="outline" 
            onClick={exportExcel} 
            className="px-8 py-4 text-base font-bold border-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Download className="w-5 h-5 mr-2 inline" />
            Export Excel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '3rem' }}>
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 hover:shadow-2xl hover:border-[#3a8735] transition-all transform hover:scale-105">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#3a8735] to-[#4fa349] rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Total Orders</p>
            <p className="text-5xl font-extrabold text-gray-900">{stats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 hover:shadow-2xl hover:border-yellow-400 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Pending Orders</p>
            <p className="text-5xl font-extrabold text-yellow-600">{stats.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 hover:shadow-2xl hover:border-green-400 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Delivered</p>
            <p className="text-5xl font-extrabold text-green-600">{stats.deliveredOrders}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 hover:shadow-2xl hover:border-[#3a8735] transition-all transform hover:scale-105">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#3a8735] to-[#4fa349] rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Total Revenue</p>
            <p className="text-5xl font-extrabold text-[#3a8735]">₹{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginBottom: '3rem' }}>
          <div
            onClick={() => router.push('/admin/products')}
            className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-10 cursor-pointer hover:shadow-2xl hover:border-[#3a8735] transition-all group transform hover:scale-105"
          >
            <div className="flex items-center gap-6" style={{ marginBottom: '1.5rem' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#3a8735] to-[#4fa349] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Products</h3>
                <p className="text-base text-gray-600">Add, edit, or view products</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push('/admin/orders')}
            className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-10 cursor-pointer hover:shadow-2xl hover:border-blue-500 transition-all group transform hover:scale-105"
          >
            <div className="flex items-center gap-6" style={{ marginBottom: '1.5rem' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Orders</h3>
                <p className="text-base text-gray-600">View and update all orders</p>
              </div>
            </div>
          </div>

          <div
            onClick={exportExcel}
            className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-10 cursor-pointer hover:shadow-2xl hover:border-purple-500 transition-all group transform hover:scale-105"
          >
            <div className="flex items-center gap-6" style={{ marginBottom: '1.5rem' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <Download className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h3>
                <p className="text-base text-gray-600">Download orders to Excel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="px-10 py-8 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Orders</h2>
            <p className="text-base text-gray-600 font-medium">Latest 10 orders from your customers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-6 px-10 text-sm font-bold text-gray-700 uppercase tracking-wider">Order #</th>
                  <th className="text-left py-6 px-10 text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-6 px-10 text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-6 px-10 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-left py-6 px-10 text-sm font-bold text-gray-700 uppercase tracking-wider">Delivery Date</th>
                  <th className="text-left py-6 px-10 text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-10">
                      <span className="font-bold text-gray-900 text-base">{order.orderNumber}</span>
                    </td>
                    <td className="py-6 px-10">
                      <div>
                        <div className="font-bold text-gray-900 text-base">{order.customerName}</div>
                        <div className="text-sm text-gray-500 mt-1">{order.customerMobile}</div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <span className="font-extrabold text-xl text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="py-6 px-10">
                      <span className={`inline-flex px-5 py-2.5 rounded-xl text-xs font-bold border-2 shadow-md ${
                        order.status === 'paid' ? 'bg-[#3a8735] text-white border-[#2d6a29]' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-300' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-6 px-10 text-base text-gray-600 font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    <td className="py-6 px-10">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-sm px-5 py-2.5 font-bold border-2"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-20">
              <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-600 text-xl font-semibold mb-2">No orders yet.</p>
              <p className="text-gray-500 text-base">Orders will appear here once customers start placing them.</p>
            </div>
          )}
          {orders.length > 10 && (
            <div className="px-10 py-8 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white text-center">
              <Button variant="outline" onClick={() => router.push('/admin/orders')} className="px-8 py-4 text-base font-bold border-2">
                View All Orders ({orders.length})
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
