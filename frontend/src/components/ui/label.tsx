import { forwardRef } from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <label
        className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);