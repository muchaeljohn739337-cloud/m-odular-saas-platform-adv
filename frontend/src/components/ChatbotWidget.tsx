"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const BOTPRESS_ID = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID;

type Msg = { role: "user" | "bot"; text: string; at: string };

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{
    role: "bot",
    text: "Hi! I’m Advancia Help. I can guide payments, debit card orders, Med Beds, OTP, and more. How can I help?",
    at: new Date().toISOString(),
  }]);
  const sessionId = useMemo(() => {
    const existing = typeof window !== 'undefined' ? localStorage.getItem("chatSessionId") : null;
    if (existing) return existing;
    const s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    if (typeof window !== 'undefined') localStorage.setItem("chatSessionId", s);
    return s;
  }, []);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // If Botpress is configured, load it and hide our minimal widget
  useEffect(() => {
    if (!BOTPRESS_ID) return;
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text, at: new Date().toISOString() }]);
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, from: 'guest' }),
      });
      const data = await r.json();
      if (data?.reply) {
        setMessages((m) => [...m, { role: 'bot', text: data.reply, at: new Date().toISOString() }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I could not reach support right now.', at: new Date().toISOString() }]);
    } finally {
      setBusy(false);
    }
  };

  const Quick = ({ label, text }: { label: string; text: string }) => (
    <button onClick={() => setInput(text)} className="px-3 py-1 text-sm border rounded-full hover:bg-gray-50">{label}</button>
  );

  // If Botpress ID is present, prefer Botpress UI, otherwise render minimal widget
  if (BOTPRESS_ID) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}
        className="rounded-full bg-blue-600 text-white shadow-xl w-14 h-14 flex items-center justify-center hover:bg-blue-700"
        aria-label="Open Advancia Help"
      >
        {open ? '×' : 'AI'}
      </button>

      {/* Panel */}
      {open && (
        <div style={{ position: 'fixed', right: 20, bottom: 90, width: 360, height: 520, zIndex: 9999 }} className="bg-white border shadow-2xl rounded-xl flex flex-col">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
            <div className="font-semibold">Advancia Help</div>
            <div className="text-xs opacity-90">Live chat + guided help</div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] ${m.role === 'user' ? 'ml-auto text-white bg-blue-600' : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-lg`}>{m.text}</div>
            ))}
          </div>
          <div className="px-3 pb-2 space-x-2 flex flex-wrap">
            <Quick label="Top up" text="How do I add funds?" />
            <Quick label="Debit Card" text="How to order a debit card?" />
            <Quick label="Med Beds" text="How to book Med Beds?" />
            <Quick label="OTP" text="Help with 2FA/OTP" />
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type your message..."
              className="flex-1 border rounded-full px-3 py-2 focus:outline-none"
            />
            <button onClick={send} disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50">Send</button>
          </div>
        </div>
      )}
    </>
  );
}
