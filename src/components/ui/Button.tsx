import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'py-3.5 px-6 font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-neutral-900 text-white hover:bg-black rounded-2xl shadow-sm',
    secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 rounded-2xl',
    outline: 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 rounded-2xl',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl border border-rose-200',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};