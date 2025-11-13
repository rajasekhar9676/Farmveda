'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutContent from './CheckoutContent';

function CheckoutWrapper() {
  const searchParams = useSearchParams();
  const deliveryDate = searchParams?.get('date') || new Date().toISOString().split('T')[0];
  
  return <CheckoutContent deliveryDate={deliveryDate} />;
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutWrapper />
    </Suspense>
  );
}
