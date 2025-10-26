/**
 * Barrel exports for commonly used components
 * Follows Advancia Pay Ledger component organization
 */

// Layout Components
export { default as SidebarLayout } from "./SidebarLayout";

// Auth & Role Components
export { default as RequireRole } from "./RequireRole";

// Admin Components
export { default as CryptoAdminPanel } from "./CryptoAdminPanel";
export { default as AdminSidebar } from "./AdminSidebar";
export { default as AdminTransactionTable } from "./admin/AdminTransactionTable";
export { default as SilentModeSwitch } from "./admin/SilentModeSwitch";

// Dashboard Components
export { default as DashboardHeader } from "./dashboard/DashboardHeader";
export { default as DashboardStats } from "./dashboard/DashboardStats";

// Shared UI Components
export { default as LoadingSpinner } from "./LoadingSpinner";
