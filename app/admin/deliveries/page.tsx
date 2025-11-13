'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { ArrowLeft, Plus, X, Package, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Delivery, Product, DeliveryItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState({
    deliveryDate: '',
    products: [] as DeliveryItem[],
  });
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeliveries();
    loadProducts();
  }, []);

  const loadDeliveries = async () => {
    try {
      const res = await fetch('/api/deliveries', { credentials: 'include' });
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products', { credentials: 'include' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.has(product.id)) {
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        setFormData(prev => ({
          ...prev,
          products: prev.products.filter(p => p.productId !== product.id),
        }));
        return newSet;
      });
    } else {
      setSelectedProducts(prev => new Set(prev).add(product.id));
      setFormData(prev => ({
        ...prev,
        products: [
          ...prev.products,
          {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: product.quantity,
            unit: product.unit,
            description: product.description || '',
            image: product.image || '',
          },
        ],
      }));
    }
  };

  const handleUpdateProduct = (productId: string, field: 'price' | 'quantity', value: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.productId === productId ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.productId !== productId),
    }));
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      deliveryDate: delivery.deliveryDate,
      products: delivery.products,
    });
    setSelectedProducts(new Set(delivery.products.map(p => p.productId)));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.deliveryDate) {
      setError('Delivery date is required');
      setLoading(false);
      return;
    }

    if (formData.products.length === 0) {
      setError('Please select at least one product');
      setLoading(false);
      return;
    }

    try {
      const url = editingDelivery
        ? `/api/deliveries/${editingDelivery.id}`
        : '/api/deliveries';
      const method = editingDelivery ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setShowForm(false);
        setEditingDelivery(null);
        setFormData({
          deliveryDate: '',
          products: [],
        });
        setSelectedProducts(new Set());
        loadDeliveries();
      } else {
        setError(data.error || 'Failed to save delivery');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        loadDeliveries();
      } else {
        alert('Failed to delete delivery');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (res.ok) {
        loadDeliveries();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
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
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8 w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Schedule</h1>
            <p className="text-sm text-gray-600">Create and manage delivery batches with products</p>
          </div>
          <Button onClick={() => {
            setShowForm(!showForm);
            setEditingDelivery(null);
            setFormData({ deliveryDate: '', products: [] });
            setSelectedProducts(new Set());
          }} className="px-5 py-2.5 text-sm font-semibold">
            <Plus className="w-4 h-4 mr-2 inline" />
            {showForm ? 'Cancel' : 'Create Delivery'}
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingDelivery ? 'Edit Delivery' : 'Create New Delivery'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Products from Catalog
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProducts.has(product.id)
                          ? 'border-[#3a8735] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleAddProduct(product);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-[#3a8735] border-gray-300 rounded cursor-pointer"
                        />
                        <span 
                          className="text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleAddProduct(product)}
                        >
                          {product.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{formatCurrency(product.price)} / {product.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {formData.products.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Modify Products (Price & Quantity)
                  </label>
                  <div className="space-y-3">
                    {formData.products.map((item, idx) => (
                      <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                            <p className="text-xs text-gray-600 capitalize">{item.unit}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleUpdateProduct(item.productId, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity (Reference Only)
                              <span className="text-gray-500 text-xs ml-1">(for pricing reference)</span>
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateProduct(item.productId, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-semibold">
                  {loading ? 'Saving...' : editingDelivery ? 'Update Delivery' : 'Create Delivery'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDelivery(null);
                    setFormData({ deliveryDate: '', products: [] });
                    setSelectedProducts(new Set());
                  }}
                  className="px-6 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Deliveries List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">All Deliveries</h2>
            <p className="text-sm text-gray-600 mt-1">{deliveries.length} delivery batch(es)</p>
          </div>
          <div className="divide-y divide-gray-200">
            {deliveries.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-base font-semibold mb-1">No deliveries created yet.</p>
                <p className="text-gray-500 text-sm">Click "Create Delivery" to get started.</p>
              </div>
            ) : (
              deliveries.map(delivery => (
                <div key={delivery.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-[#3a8735]" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {new Date(delivery.deliveryDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          delivery.status === 'active' ? 'bg-green-100 text-green-800' :
                          delivery.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {delivery.products.length} product(s) • Created {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={delivery.status}
                        onChange={(e) => handleStatusChange(delivery.id, e.target.value as any)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735]"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleEdit(delivery)}
                        className="p-2 text-[#3a8735] hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(delivery.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {delivery.products.map((product, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-sm text-gray-900">{product.productName}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatCurrency(product.price)} / {product.unit} • Qty: {product.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

