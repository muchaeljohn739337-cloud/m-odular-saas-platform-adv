"use client";

import { useState, useEffect, useCallback } from "react";

interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const fetchDoctors = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const adminKey =
        process.env.NEXT_PUBLIC_ADMIN_KEY || "supersecureadminkey123";

      const url =
        filter === "ALL"
          ? `${apiUrl}/api/admin/doctors`
          : `${apiUrl}/api/admin/doctors?status=${filter}`;

      const res = await fetch(url, {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDoctors(data.doctors || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch doctors";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleVerify = async (doctorId: string) => {
    if (!confirm("Are you sure you want to verify this doctor?")) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const adminKey =
        process.env.NEXT_PUBLIC_ADMIN_KEY || "supersecureadminkey123";

      const res = await fetch(`${apiUrl}/api/admin/doctor/${doctorId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ adminId: "admin-user" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Doctor verified successfully!");
      fetchDoctors(); // Refresh list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to verify doctor";
      alert(errorMessage);
    }
  };

  const handleSuspend = async (doctorId: string) => {
    if (!confirm("Are you sure you want to suspend this doctor?")) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const adminKey =
        process.env.NEXT_PUBLIC_ADMIN_KEY || "supersecureadminkey123";

      const res = await fetch(
        `${apiUrl}/api/admin/doctor/${doctorId}/suspend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Doctor suspended successfully!");
      fetchDoctors();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to suspend doctor";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Admin Dashboard - Doctor Management
          </h1>
          <p className="text-gray-600">
            Verify and manage doctor registrations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            All Doctors
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "PENDING"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("VERIFIED")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "VERIFIED"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilter("SUSPENDED")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "SUSPENDED"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Suspended
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No doctors found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {doctor.firstName} {doctor.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.status === "VERIFIED"
                            ? "bg-green-100 text-green-800"
                            : doctor.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {doctor.status === "PENDING" && (
                        <button
                          onClick={() => handleVerify(doctor.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          ✓ Verify
                        </button>
                      )}
                      {doctor.status === "VERIFIED" && (
                        <button
                          onClick={() => handleSuspend(doctor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ✕ Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
