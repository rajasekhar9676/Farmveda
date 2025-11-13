import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base';
  
  const variants = {
    primary: 'bg-[#3a8735] text-white hover:bg-[#2d6a29] shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#3a8735] text-[#3a8735] hover:bg-[#3a8735] hover:text-white shadow-md hover:shadow-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
