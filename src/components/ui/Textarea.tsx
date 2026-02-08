"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      className = "",
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const charCount = typeof value === "string" ? value.length : 0;

    const baseTextareaStyles = `
      w-full bg-secondary/50 border rounded-lg
      text-sm text-foreground placeholder:text-muted-foreground
      transition-all duration-150
      focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
      px-3 py-2.5 min-h-[120px] resize-y
    `;

    const errorStyles = error
      ? "border-status-error focus:border-status-error focus:ring-status-error/10"
      : "border-border/50";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={`
            ${baseTextareaStyles}
            ${errorStyles}
            ${className}
          `}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p className="text-xs text-status-error">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p
              className={`text-xs ${
                charCount > maxLength * 0.9
                  ? "text-status-warning"
                  : "text-muted-foreground"
              }`}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
