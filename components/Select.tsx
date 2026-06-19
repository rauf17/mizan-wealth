import React, { forwardRef } from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-heading">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`mizan-select ${className}`.trim()}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span className="text-[11px] text-red-500 mt-1 block">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
