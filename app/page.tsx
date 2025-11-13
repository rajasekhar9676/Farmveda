'use client';

import { useState } from 'react';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { setAuthToken } from '@/lib/client-auth';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [communityOrApartment, setCommunityOrApartment] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          setAuthToken(data.token);
        }
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !mobile || !password || !email) {
      setError('Name, mobile, email, and password are required');
      setLoading(false);
      return;
    }

    const address = {
      communityName: communityOrApartment || '',
      apartmentName: communityOrApartment || '',
      roomNo: roomNo || '',
      street: '',
      city: '',
      pincode: '',
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, email, password, address }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          setAuthToken(data.token);
        }
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Registration failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 pt-8 pb-4 text-center border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-sm text-gray-600">
              {isLogin ? 'Sign in to continue to FarmVeda' : 'Join FarmVeda and start ordering fresh products'}
            </p>
          </div>

          {/* Card Content */}
          <div className="px-6 pb-8 pt-6">
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {!isLogin && (
                <div className="space-y-4 pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Address (Optional)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="community" className="text-sm font-medium text-gray-700">
                      Community or Apartment Name
                    </label>
                    <input
                      id="community"
                      name="community"
                      type="text"
                      value={communityOrApartment}
                      onChange={(e) => setCommunityOrApartment(e.target.value)}
                      placeholder="Enter community or apartment name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="roomNo" className="text-sm font-medium text-gray-700">
                      Room No
                    </label>
                    <input
                      id="roomNo"
                      name="roomNo"
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      placeholder="Enter room number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] transition-all bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#3a8735] hover:bg-[#2d6a29] text-white py-3 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-gray-600">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setMobile('');
                    setPassword('');
                    setName('');
                    setEmail('');
                    setCommunityOrApartment('');
                    setRoomNo('');
                  }}
                  className="text-[#3a8735] hover:text-[#2d6a29] font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </div>

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600">Admin? </span>
                <a
                  href="/admin/login"
                  className="text-[#3a8735] hover:text-[#2d6a29] font-medium"
                >
                  Login here
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
