'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { Delivery, DeliveryItem } from '@/lib/types';
import { ShoppingCart, ArrowLeft, Image as ImageIcon, Plus, Minus, Calendar, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Catalog() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        setCart(cartData);
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deliveries?role=customer');
      const data = await res.json();
      setDeliveries(data.deliveries || []);
      
      // Auto-select first available delivery
      if (data.deliveries && data.deliveries.length > 0) {
        const firstDelivery = data.deliveries[0];
        setSelectedDelivery(firstDelivery);
        setSelectedDate(firstDelivery.deliveryDate);
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Find delivery for selected date
    const delivery = deliveries.find(d => d.deliveryDate === date);
    setSelectedDelivery(delivery || null);
    
    // Clear cart when date changes
    setCart([]);
    localStorage.removeItem('cart');
  };

  const addToCart = (productId: string) => {
    if (!selectedDelivery) return;
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      // Allow any quantity - no restrictions
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity: quantity } : item
      ));
    }
  };

  const handleQuantityInput = (productId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      // Allow any quantity - no restrictions
      updateCartQuantity(productId, quantity);
    }
  };

  const getCartTotal = () => {
    if (!selectedDelivery) return 0;
    return cart.reduce((total, item) => {
      const product = selectedDelivery.products.find(p => p.productId === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!selectedDate || !selectedDelivery) {
      alert('Please select a delivery date');
      return;
    }
    router.push(`/checkout?date=${selectedDate}`);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Logo />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-[#3a8735]" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-6 h-6 text-[#3a8735]" />
            <h2 className="text-xl font-bold text-gray-900">Upcoming Deliveries</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select a delivery date to view and order products available for that delivery.
          </p>
          {deliveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveries.map(delivery => (
                <button
                  key={delivery.id}
                  onClick={() => {
                    setSelectedDate(delivery.deliveryDate);
                    setSelectedDelivery(delivery);
                    setCart([]);
                    localStorage.removeItem('cart');
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDelivery?.id === delivery.id
                      ? 'border-[#3a8735] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 mb-1">
                    {new Date(delivery.deliveryDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {delivery.products.length} product(s) available
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No upcoming deliveries scheduled.</p>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-[#3a8735] text-xl font-semibold">Loading...</div>
          </div>
        ) : !selectedDelivery ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Please select a delivery date</p>
            <p className="text-sm text-gray-500 mt-2">Choose a delivery from above to see available products</p>
          </div>
        ) : selectedDelivery.products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No products in this delivery</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700">
                {selectedDelivery.products.length} product{selectedDelivery.products.length !== 1 ? 's' : ''} available for delivery on {new Date(selectedDelivery.deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDelivery.products.map((product, idx) => {
                const cartItem = cart.find(item => item.productId === product.productId);
                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                    {product.image ? (
                      <div className="w-full h-48 bg-gray-100 overflow-hidden">
                        <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{product.productName}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-3">{product.description}</p>
                      )}
                      <p className="text-2xl font-bold text-[#3a8735] mb-3">
                        {formatCurrency(product.price)} / {product.unit}
                      </p>

                      {cartItem ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateCartQuantity(product.productId, cartItem.quantity - 1)}
                              className="w-10 h-10 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-lg transition-colors"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={cartItem.quantity}
                              onChange={(e) => handleQuantityInput(product.productId, e.target.value)}
                              className="flex-1 text-center font-semibold text-lg px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735]"
                            />
                            <button
                              onClick={() => updateCartQuantity(product.productId, cartItem.quantity + 1)}
                              className="w-10 h-10 rounded-xl bg-[#3a8735] text-white hover:bg-[#2d6a29] flex items-center justify-center font-bold text-lg transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(product.productId)}
                          className="w-full"
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && selectedDate && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 z-20">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Delivery Date: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Items: <span className="font-semibold">{cart.length}</span>
                </p>
                <p className="text-2xl font-bold text-[#3a8735]">
                  Total: {formatCurrency(getCartTotal())}
                </p>
              </div>
              <Button onClick={handleCheckout} className="px-8 py-3 text-base font-semibold">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
