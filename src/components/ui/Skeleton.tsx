"use client";

import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-secondary";

  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const dimensionStyles: React.CSSProperties = {
    width: width ?? (variant === "circular" ? "40px" : "100%"),
    height:
      height ??
      (variant === "text" ? "1rem" : variant === "circular" ? "40px" : "100px"),
    ...style,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={dimensionStyles}
      {...props}
    />
  );
}

// Common skeleton patterns
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height="0.75rem" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={80} />
    </div>
  );
}

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" width={i === 0 ? "70%" : "50%"} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton variant="text" width={100} height="0.875rem" />
          <Skeleton variant="rectangular" height={42} />
        </div>
      ))}
    </div>
  );
}
