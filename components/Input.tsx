import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-heading">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`mizan-input ${className}`.trim()}
          {...props}
        />
        {error && (
          <span className="text-[11px] text-red-500 mt-1 block">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
