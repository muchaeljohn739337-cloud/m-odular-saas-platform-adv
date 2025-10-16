"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useSession } from "next-auth/react";

type SessionUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string | null;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  
  // Check if user is admin
  const userRole = sessionUser?.role || sessionUser?.email;
  const isAdmin = userRole === "admin" || 
                  sessionUser?.email === "admin@advancia.com" ||
                  sessionUser?.email?.includes("admin");

  const displayName = useMemo(() => {
    if (sessionUser?.name && sessionUser.name.trim().length > 0) {
      return sessionUser.name;
    }
    if (sessionUser?.email) {
      return sessionUser.email.split("@")[0];
    }
    return "Guest";
  }, [sessionUser?.name, sessionUser?.email]);

  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    const primary = parts[0]?.[0] ?? "";
    const secondary = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${primary}${secondary}`.toUpperCase();
  }, [displayName]);

  const navLinkClasses =
    "flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-8">
          Advancia<span className="text-gray-600">Pay</span>
        </h1>
        <nav className="flex-1 space-y-3">
          <Link href="/" className={navLinkClasses}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link href="/analytics" className={navLinkClasses}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
          <Link href="/assets" className={navLinkClasses}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            My Assets
          </Link>
          <Link href="/features" className={navLinkClasses}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Features
          </Link>
          <Link href="/settings" className={navLinkClasses}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
          <Link href="/profile" className={navLinkClasses}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118 8m0 0v5m0-5h-5" />
            </svg>
            Profile
          </Link>
          
          {/* Admin Panel - Only visible to admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border-t-2 border-red-200 mt-3 pt-3 text-gray-700 hover:text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-bold text-red-600">Admin Panel</span>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-200">
          {sessionUser?.image ? (
            <Image
              src={sessionUser.image}
              alt={`${displayName}'s profile photo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {initials || "U"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">{displayName}</span>
            {sessionUser?.email && (
              <span className="text-xs text-gray-500">{sessionUser.email}</span>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 bg-gray-50">{children}</div>
    </div>
  );
}