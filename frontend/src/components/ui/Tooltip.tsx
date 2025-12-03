"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

// ==========================================
// Tooltip Types
// ==========================================

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

// ==========================================
// Tooltip Component
// ==========================================

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent",
};

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg",
            "whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-100",
            positionStyles[position],
            className
          )}
          role="tooltip"
        >
          {content}
          <span
            className={cn("absolute w-0 h-0 border-4", arrowStyles[position])}
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// Info Tooltip
// ==========================================

export function InfoTooltip({
  content,
  position = "top",
  className,
}: {
  content: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}) {
  return (
    <Tooltip content={content} position={position} className={className}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-500 bg-gray-100 rounded-full cursor-help hover:bg-gray-200">
        ?
      </span>
    </Tooltip>
  );
}

// ==========================================
// Popover
// ==========================================

interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}

export function Popover({
  content,
  children,
  position = "bottom",
  className,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={popoverRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200",
            "min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-100",
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
