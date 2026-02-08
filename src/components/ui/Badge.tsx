"use client";

import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "accent";
  size?: "sm" | "md";
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    whitespace-nowrap
  `;

  const variantStyles = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-status-success-bg text-status-success-text",
    warning: "bg-status-warning-bg text-status-warning-text",
    error: "bg-status-error-bg text-status-error-text",
    info: "bg-status-info-bg text-status-info-text",
    accent: "bg-accent/10 text-accent",
  };

  const dotColors = {
    default: "bg-muted-foreground",
    success: "bg-status-success",
    warning: "bg-status-warning",
    error: "bg-status-error",
    info: "bg-status-info",
    accent: "bg-accent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`${dotSizes[size]} ${dotColors[variant]} rounded-full flex-shrink-0`}
        />
      )}
      {children}
    </span>
  );
}
