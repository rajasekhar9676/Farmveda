import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {label}
        </label>
      )}
      <input
        className={`w-full px-5 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-[#3a8735] focus:border-[#3a8735] 
          transition-all duration-200 bg-white
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'} 
          ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
