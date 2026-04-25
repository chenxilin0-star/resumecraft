import { cn } from '@/utils/helpers';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-md placeholder:text-gray-400 transition-colors duration-150',
            'focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100',
            error && 'border-error focus:border-error focus:ring-red-100',
            props.disabled && 'bg-gray-100 text-gray-400 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
