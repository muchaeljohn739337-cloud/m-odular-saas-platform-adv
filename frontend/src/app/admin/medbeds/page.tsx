"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminMedbedsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${API}/api/support/admin/tickets?subject=Med Beds Appointment Request`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!r.ok) throw new Error(`Failed: ${r.status}`);
      const j = await r.json();
      setTickets(j);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/api/support/admin/tickets/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ status }),
    });
    if (r.ok) load();
  }

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Med Beds Requests</h1>
        {loading ? <div>Loading…</div> : error ? <div className="text-red-600">{error}</div> : (
          <div className="bg-white shadow rounded border">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Created</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Message</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2 text-sm text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="p-2">{t.subject}</td>
                    <td className="p-2 text-sm whitespace-pre-wrap">{t.message}</td>
                    <td className="p-2">{t.status}</td>
                    <td className="p-2 space-x-2">
                      <button onClick={() => updateStatus(t.id, 'IN_PROGRESS')} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded">In Progress</button>
                      <button onClick={() => updateStatus(t.id, 'RESOLVED')} className="px-3 py-1 text-xs bg-green-600 text-white rounded">Resolved</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
