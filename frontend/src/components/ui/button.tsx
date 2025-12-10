import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      default: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-red-600 text-red-600 hover:bg-red-50",
      ghost: "text-red-600 hover:bg-red-50"
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg"
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-md ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);