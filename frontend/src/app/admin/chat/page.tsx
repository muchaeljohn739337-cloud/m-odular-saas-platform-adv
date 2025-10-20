"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminChatMonitor() {
  type ChatEvent = { at: string; sessionId: string; from: string; userId?: string; message: string };
  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    if (!t) return;
    const s: Socket = io(API, { transports: ['websocket'], auth: { token: `Bearer ${t}` } });
    s.on('connect', () => {
      console.log('Admin chat monitor connected');
    });
    s.on('admin:chat:message', (payload) => {
      setEvents((e) => [payload, ...e].slice(0, 200));
    });
    return () => { s.disconnect(); };
  }, []);

  if (!token) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-3">Admin Chat Monitor</h1>
  <p className="text-sm text-gray-600">Paste an admin Bearer token into localStorage as &apos;token&apos; and reload.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin Chat Monitor</h1>
      <div className="text-sm text-gray-600">Listening for user messages...</div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="border rounded p-3">
            <div className="text-xs text-gray-500">{e.at}</div>
            <div className="font-medium">Session: {e.sessionId}</div>
            <div className="text-sm">From: {e.from}{e.userId ? ` (${e.userId})` : ''}</div>
            <div className="mt-1">{e.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
