'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { ArrowLeft, Plus, Image as ImageIcon, X, Package } from 'lucide-react';
import { Product, ProductUnit } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: 'kilo' as ProductUnit,
    availableDate: new Date().toISOString().split('T')[0],
    description: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products', { credentials: 'include' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: '',
          price: '',
          quantity: '',
          unit: 'kilo',
          availableDate: new Date().toISOString().split('T')[0],
          description: '',
          image: '',
        });
        loadProducts();
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Products Management</h1>
            <p className="text-lg text-gray-600">Add and manage your product catalog</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="px-6 py-3 text-base">
            <Plus className="w-5 h-5 mr-2 inline" />
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 mb-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Product Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fresh Mangoes"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Delivery Date (When this product will be delivered) *
                  </label>
                  <input
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Select the delivery date. Customers will only see this product when they select this date. You can post products today for tomorrow's delivery.
                  </p>
                </div>

                <Input
                  label="Price (₹) *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 500"
                  required
                />

                <Input
                  label="Quantity *"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 100"
                  required
                />

                <Select
                  label="Unit *"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                  options={[
                    { value: 'kilo', label: 'Kilo' },
                    { value: 'pieces', label: 'Pieces' },
                    { value: 'boxes', label: 'Boxes' },
                  ]}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#3a8735] transition-colors bg-white">
                      <ImageIcon className="w-5 h-5 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.image && (
                      <div className="relative">
                        <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Input
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-lg">
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="px-8 py-3 text-base">
                  {loading ? 'Adding...' : 'Add Product'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="px-8 py-3 text-base">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
            <p className="text-sm text-gray-600 mt-1">{products.length} product(s) in catalog</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                  <th className="text-left py-5 px-8 text-sm font-bold text-gray-700 uppercase tracking-wider">Available Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-lg text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="py-5 px-8">
                      <span className="text-base font-semibold text-gray-800">{product.quantity}</span>
                    </td>
                    <td className="py-5 px-8">
                      <span className="text-base capitalize font-semibold text-gray-800">{product.unit}</span>
                    </td>
                    <td className="py-5 px-8 text-base text-gray-600">{new Date(product.availableDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No products added yet.</p>
              <p className="text-gray-500 text-sm mt-2">Click "Add Product" to start building your catalog.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
