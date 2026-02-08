"use client";

import type { ReactNode, HTMLAttributes } from "react";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  iconColor?: "primary" | "accent" | "success" | "warning" | "error" | "info";
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({
  icon,
  iconColor = "primary",
  title,
  description,
  action,
  className = "",
  ...props
}: SectionHeaderProps) {
  const iconColorStyles = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-status-success-bg text-status-success",
    warning: "bg-status-warning-bg text-status-warning",
    error: "bg-status-error-bg text-status-error",
    info: "bg-status-info-bg text-status-info",
  };

  return (
    <div
      className={`flex items-center justify-between ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${iconColorStyles[iconColor]}
            `}
          >
            <span className="w-5 h-5">{icon}</span>
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
