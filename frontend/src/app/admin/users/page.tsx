"use client";
import { useState, useEffect, useCallback } from "react";
import RequireRole from "@/components/RequireRole";

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  usdBalance: number;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [showFundModal, setShowFundModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [bulkBatchSize, setBulkBatchSize] = useState<string>("1000");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/users/update-role/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      alert("Role updated successfully!");
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      alert(message);
    }
  };

  const handleFundUser = async () => {
    if (!selectedUser || !fundAmount) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/users/fund/${selectedUser.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseFloat(fundAmount) }),
      });

      if (!response.ok) {
        throw new Error("Failed to fund user");
      }

      alert(`Successfully funded $${fundAmount} to ${selectedUser.email}`);
      setShowFundModal(false);
      setFundAmount("");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fund user";
      alert(message);
    }
  };

  const handleBulkCredit = async () => {
    if (!bulkAmount) return;
    setBulkLoading(true);
    try {
      const token = localStorage.getItem("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/fund-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseFloat(bulkAmount), description: bulkDescription || undefined, batchSize: parseInt(bulkBatchSize || "1000", 10) }),
      });
      if (!response.ok) {
        const j: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(j.error || `Failed: ${response.status}`);
      }
      const data = await response.json();
      alert(`✅ Bulk credit queued\nUsers: ${data.creditedUsers}\nAmount per user: $${data.amountPerUser}\nTotal: $${data.totalAmount}`);
      setShowBulkModal(false);
      setBulkAmount("");
      setBulkDescription("");
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed bulk credit";
      alert(message);
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <RequireRole roles={["ADMIN"]}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage user roles, balances, and account status
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by email, username, or name..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Bulk Credit Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Bulk credit all users
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              {user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : user.role === "STAFF"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <option value="USER">USER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          ${Number(user.usdBalance).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowFundModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                          Fund Wallet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fund Modal */}
        {showFundModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Fund User Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Adding funds to: <strong>{selectedUser.email}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFundModal(false);
                    setFundAmount("");
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFundUser}
                  disabled={!fundAmount || parseFloat(fundAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fund Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Credit Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Bulk credit all users</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="e.g. 25.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Batch size</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={bulkBatchSize}
                  onChange={(e) => setBulkBatchSize(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="e.g. 1000"
                />
                <p className="text-xs text-gray-500 mt-1">Processed in batches per transaction for performance and safety.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Promo Airdrop, Compensation, etc."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 border rounded dark:border-gray-700 dark:text-white">Cancel</button>
              <button
                onClick={handleBulkCredit}
                disabled={bulkLoading || !bulkAmount}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {bulkLoading ? "Processing..." : "Confirm credit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </RequireRole>
  );
}
