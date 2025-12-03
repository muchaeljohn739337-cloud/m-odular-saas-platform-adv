"use client";

import { cn } from "@/lib/utils";

// ==========================================
// Spinner Types
// ==========================================

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerVariant = "default" | "primary" | "white";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
}

// ==========================================
// Spinner Component
// ==========================================

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const variantStyles: Record<SpinnerVariant, string> = {
  default: "text-gray-400",
  primary: "text-blue-600",
  white: "text-white",
};

export function Spinner({
  size = "md",
  variant = "default",
  className,
  label,
}: SpinnerProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
    >
      <svg
        className={cn("animate-spin", sizeStyles[size], variantStyles[variant])}
        xmlns="http://www.w3.org/2000/svg"
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
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <span className="sr-only">{label || "Loading..."}</span>
    </div>
  );
}

// ==========================================
// Full Page Spinner
// ==========================================

export function FullPageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="xl" variant="primary" />
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}

// ==========================================
// Button Spinner
// ==========================================

export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" variant="white" className={className} />;
}

// ==========================================
// Skeleton Loader
// ==========================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const roundedStyles = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  className,
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        roundedStyles[rounded],
        className
      )}
      style={{ width, height }}
    />
  );
}

// ==========================================
// Dots Spinner
// ==========================================

export function DotsSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export default Spinner;
