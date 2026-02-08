"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-150 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantStyles = {
      primary: `
        bg-primary text-primary-foreground
        hover:bg-primary-hover active:bg-primary-hover
        focus-visible:ring-primary
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-secondary text-secondary-foreground
        hover:bg-secondary-hover active:bg-secondary-hover
        focus-visible:ring-primary
        border border-border/50
      `,
      ghost: `
        bg-transparent text-foreground
        hover:bg-secondary active:bg-secondary-hover
        focus-visible:ring-primary
      `,
      danger: `
        bg-destructive text-destructive-foreground
        hover:bg-destructive-hover active:bg-destructive-hover
        focus-visible:ring-destructive
        shadow-sm hover:shadow-md
      `,
      accent: `
        bg-accent text-accent-foreground
        hover:bg-accent-hover active:bg-accent-hover
        focus-visible:ring-accent
        shadow-sm hover:shadow-md
      `,
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    const iconSizeStyles = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className={`${iconSizeStyles[size]} animate-spin`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={iconSizeStyles[size]}>{leftIcon}</span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span className={iconSizeStyles[size]}>{rightIcon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
