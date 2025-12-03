"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useState } from "react";

// ==========================================
// Sidebar Context
// ==========================================

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// ==========================================
// Sidebar Provider
// ==========================================

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ==========================================
// Sidebar Component
// ==========================================

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300",
          "flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          // Mobile styles
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {children}
      </aside>

      {/* Spacer for main content */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      />
    </>
  );
}

// ==========================================
// Sidebar Header
// ==========================================

interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}

// ==========================================
// Sidebar Content
// ==========================================

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <nav className={cn("flex-1 overflow-y-auto p-2", className)}>
      {children}
    </nav>
  );
}

// ==========================================
// Sidebar Footer
// ==========================================

interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("p-4 border-t border-gray-200 mt-auto", className)}>
      {children}
    </div>
  );
}

// ==========================================
// Sidebar Group
// ==========================================

interface SidebarGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarGroup({
  label,
  children,
  className,
}: SidebarGroupProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn("mb-4", className)}>
      {label && !isCollapsed && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// ==========================================
// Sidebar Item
// ==========================================

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  className?: string;
}

export function SidebarItem({
  href,
  icon,
  label,
  badge,
  className,
}: SidebarItemProps) {
  const pathname = usePathname();
  const { isCollapsed, setMobileOpen } = useSidebar();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-gray-100",
        isActive && "bg-blue-50 text-blue-600 font-medium",
        !isActive && "text-gray-700",
        isCollapsed && "justify-center",
        className
      )}
      title={isCollapsed ? label : undefined}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ==========================================
// Sidebar Toggle Button
// ==========================================

export function SidebarToggle({ className }: { className?: string }) {
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <button
      onClick={toggleCollapse}
      className={cn(
        "p-2 rounded-lg hover:bg-gray-100 transition-colors",
        "text-gray-600 hover:text-gray-900",
        className
      )}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg
        className={cn(
          "w-5 h-5 transition-transform",
          isCollapsed && "rotate-180"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
    </button>
  );
}

// ==========================================
// Mobile Menu Button
// ==========================================

export function MobileMenuButton({ className }: { className?: string }) {
  const { setMobileOpen } = useSidebar();

  return (
    <button
      onClick={() => setMobileOpen(true)}
      className={cn(
        "lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors",
        "text-gray-600 hover:text-gray-900",
        className
      )}
      aria-label="Open menu"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}

// ==========================================
// Example Icons (inline SVG helpers)
// ==========================================

export const SidebarIcons = {
  Home: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Dashboard: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  ),
  Settings: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Users: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Payments: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  Analytics: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  Logout: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
};

export default Sidebar;
