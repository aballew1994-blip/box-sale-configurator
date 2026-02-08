"use client";

import type { HTMLAttributes } from "react";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "muted";
}

export function Spinner({
  size = "md",
  color = "primary",
  className = "",
  ...props
}: SpinnerProps) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorStyles = {
    primary: "text-primary",
    white: "text-white",
    muted: "text-muted-foreground",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      {...props}
    >
      <svg
        className="animate-spin"
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
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Inline loading indicator with text
export interface LoadingTextProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: "sm" | "md";
}

export function LoadingText({
  text = "Loading...",
  size = "md",
  className = "",
  ...props
}: LoadingTextProps) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <div
      className={`flex items-center gap-2 text-muted-foreground ${className}`}
      {...props}
    >
      <Spinner size={size === "sm" ? "sm" : "md"} color="muted" />
      <span className={textSizes[size]}>{text}</span>
    </div>
  );
}
