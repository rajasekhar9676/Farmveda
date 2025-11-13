'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { getAuthToken, removeAuthToken } from '@/lib/client-auth';
import { Package, ShoppingCart, LogOut } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user', {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        window.location.href = '/';
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/';
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    removeAuthToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-[#3a8735] text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    router.push('/admin/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <Logo />
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">Hello,</p>
                <p className="text-base font-semibold text-gray-900">{user?.name || 'User'}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="px-5 py-2.5 text-sm">
                <LogOut className="w-4 h-4 mr-2 inline" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to FarmVeda</h1>
          <p className="text-lg text-gray-600">Order fresh farm products with ease</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-0">
          <div
            onClick={() => router.push('/catalog')}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-10 cursor-pointer hover:shadow-2xl hover:border-[#3a8735] transition-all group"
          >
            <div className="flex flex-col items-start">
              <div className="w-20 h-20 bg-[#3a8735] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Browse Products</h3>
              <p className="text-base text-gray-600 leading-relaxed">View and order fresh products from our farm</p>
            </div>
          </div>

          <div
            onClick={() => router.push('/orders')}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-10 cursor-pointer hover:shadow-2xl hover:border-[#3a8735] transition-all group"
          >
            <div className="flex flex-col items-start">
              <div className="w-20 h-20 bg-[#3a8735] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">My Orders</h3>
              <p className="text-base text-gray-600 leading-relaxed">Track your orders and payment status</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
