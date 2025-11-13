'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Product, Address, Delivery } from '@/lib/types';

interface CheckoutContentProps {
  deliveryDate: string;
}

export default function CheckoutContent({ deliveryDate }: CheckoutContentProps) {
  const router = useRouter();
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [communityOrApartment, setCommunityOrApartment] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [addressOption, setAddressOption] = useState<'saved' | 'new'>('saved');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    loadProducts();
    loadUserAddress();
  }, [deliveryDate]);

  const loadProducts = async () => {
    try {
      // Try to load from deliveries first
      const deliveryRes = await fetch(`/api/deliveries?deliveryDate=${deliveryDate}&role=customer`);
      const deliveryData = await deliveryRes.json();
      
      if (deliveryData.deliveries && deliveryData.deliveries.length > 0) {
        const delivery = deliveryData.deliveries[0];
        setDelivery(delivery);
        // Convert delivery products to Product format for compatibility
        const deliveryProducts = delivery.products.map((p: any) => ({
          id: p.productId,
          name: p.productName,
          price: p.price,
          quantity: p.quantity,
          unit: p.unit,
          description: p.description,
          image: p.image,
          availableDate: delivery.deliveryDate,
          createdAt: '',
        }));
        setProducts(deliveryProducts);
      } else {
        // Fallback to products API
        const res = await fetch(`/api/products?date=${deliveryDate}&role=customer`);
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadUserAddress = async () => {
    try {
      const res = await fetch('/api/user', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.address) {
          const addr = data.user.address;
          setSavedAddress(addr);
          if (addr.communityName || addr.apartmentName) {
            setCommunityOrApartment(addr.communityName || addr.apartmentName || '');
            setRoomNo(addr.roomNo || '');
            setAddressOption('saved');
          } else {
            setAddressOption('new');
          }
        } else {
          setAddressOption('new');
        }
      }
    } catch (error) {
      console.error('Error loading address:', error);
      setAddressOption('new');
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (cart.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    let address: Address;
    
    if (addressOption === 'saved' && savedAddress) {
      address = savedAddress;
    } else {
      address = {
        communityName: communityOrApartment || '',
        apartmentName: communityOrApartment || '',
        roomNo: roomNo || '',
        street: '',
        city: '',
        pincode: '',
      };
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
          address,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('cart');
        router.push(`/orders?success=true`);
      } else {
        setError(data.error || 'Failed to place order');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <nav className="bg-white shadow-sm border-b w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/catalog')} className="hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Logo />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Select Delivery Address</h2>
              
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Saved Address Option */}
                {savedAddress && (savedAddress.communityName || savedAddress.apartmentName) && (
                  <div className="border-2 rounded-xl p-4 cursor-pointer transition-all"
                    style={{
                      borderColor: addressOption === 'saved' ? '#3a8735' : '#e5e7eb',
                      backgroundColor: addressOption === 'saved' ? '#f0fdf4' : 'white'
                    }}
                    onClick={() => setAddressOption('saved')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={addressOption === 'saved'}
                        onChange={() => setAddressOption('saved')}
                        className="mt-1 w-4 h-4 text-[#3a8735] border-gray-300 focus:ring-[#3a8735] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Saved Address</span>
                          {addressOption === 'saved' && (
                            <span className="text-xs font-semibold text-[#3a8735] bg-green-100 px-2 py-1 rounded">Selected</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">
                          <p>{savedAddress.communityName || savedAddress.apartmentName}</p>
                          {savedAddress.roomNo && <p className="mt-1">Room No: {savedAddress.roomNo}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Address Option */}
                <div className="border-2 rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    borderColor: addressOption === 'new' ? '#3a8735' : '#e5e7eb',
                    backgroundColor: addressOption === 'new' ? '#f0fdf4' : 'white'
                  }}
                  onClick={() => setAddressOption('new')}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="radio"
                      name="address"
                      checked={addressOption === 'new'}
                      onChange={() => setAddressOption('new')}
                      className="mt-1 w-4 h-4 text-[#3a8735] border-gray-300 focus:ring-[#3a8735] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Add New Address</span>
                        {addressOption === 'new' && (
                          <span className="text-xs font-semibold text-[#3a8735] bg-green-100 px-2 py-1 rounded">Selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {addressOption === 'new' && (
                    <div className="space-y-4 pl-7">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Community or Apartment Name
                        </label>
                        <input
                          type="text"
                          value={communityOrApartment}
                          onChange={(e) => setCommunityOrApartment(e.target.value)}
                          placeholder="Enter community or apartment name"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room No
                        </label>
                        <input
                          type="text"
                          value={roomNo}
                          onChange={(e) => setRoomNo(e.target.value)}
                          placeholder="Enter room number"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] bg-white text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full py-3.5 text-base font-semibold" disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex justify-between text-sm pb-3 border-b border-gray-100">
                      <span className="text-gray-600">
                        {product.name} x {item.quantity} {product.unit}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#3a8735]">{formatCurrency(getTotal())}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                Delivery Date: <span className="font-medium">{new Date(deliveryDate).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
