"use client";

import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";

// ==========================================
// Dropdown Types
// ==========================================

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

// ==========================================
// Dropdown Component
// ==========================================

export function Dropdown({ trigger, children, align = "left", className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] rounded-lg bg-white shadow-lg border border-gray-200",
            "py-1 animate-in fade-in-0 zoom-in-95 duration-100",
            alignmentClasses[align]
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ closeDropdown?: () => void }>, {
                closeDropdown: () => setIsOpen(false),
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Dropdown Item
// ==========================================

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  danger = false,
  icon,
  className,
  closeDropdown,
}: DropdownItemProps & { closeDropdown?: () => void }) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      closeDropdown?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-4 py-2 text-sm text-left transition-colors",
        "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
        disabled && "opacity-50 cursor-not-allowed",
        danger && "text-red-600 hover:bg-red-50 focus:bg-red-50",
        className
      )}
      role="menuitem"
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

// ==========================================
// Dropdown Divider
// ==========================================

export function DropdownDivider() {
  return <div className="my-1 h-px bg-gray-200" role="separator" />;
}

// ==========================================
// Dropdown Label
// ==========================================

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
}

// ==========================================
// Context Menu (Right-click dropdown)
// ==========================================

interface ContextMenuProps {
  children: React.ReactNode;
  menu: React.ReactNode;
}

export function ContextMenu({ children, menu }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] rounded-lg bg-white shadow-lg border border-gray-200 py-1"
          style={{ top: position.y, left: position.x }}
          role="menu"
        >
          {React.Children.map(menu, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ closeDropdown?: () => void }>, {
                closeDropdown: () => setIsOpen(false),
              });
            }
            return child;
          })}
        </div>
      )}
    </>
  );
}

export default Dropdown;
