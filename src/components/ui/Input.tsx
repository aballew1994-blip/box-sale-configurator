"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const baseInputStyles = `
      w-full bg-secondary/50 border rounded-lg
      text-sm text-foreground placeholder:text-muted-foreground
      transition-all duration-150
      focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
    `;

    const errorStyles = error
      ? "border-status-error focus:border-status-error focus:ring-status-error/10"
      : "border-border/50";

    const paddingStyles = leftIcon
      ? "pl-10 pr-3 py-2.5"
      : rightIcon
      ? "pl-3 pr-10 py-2.5"
      : "px-3 py-2.5";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <span className="w-4 h-4 block">{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              ${baseInputStyles}
              ${errorStyles}
              ${paddingStyles}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <span className="w-4 h-4 block">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-status-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
