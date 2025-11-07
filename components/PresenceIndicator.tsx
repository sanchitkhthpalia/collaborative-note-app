"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PRESENCE_PREFIX = "notes-presence:"; // key per note: notes-presence:<noteId>

interface PresenceIndicatorProps {
  noteId: string;
}

export default function PresenceIndicator({ noteId }: PresenceIndicatorProps) {
  const clientIdRef = useRef<string>(`client-${Math.random().toString(36).slice(2)}`);
  const [count, setCount] = useState(1);

  useEffect(() => {
    const key = `${PRESENCE_PREFIX}${noteId}`;
    let disposed = false;

    const heartbeat = () => {
      try {
        const now = Date.now();
        const entry = { id: clientIdRef.current, lastSeen: now };
        const raw = localStorage.getItem(key);
        let list: { id: string; lastSeen: number }[] = [];
        if (raw) {
          try { list = JSON.parse(raw) || []; } catch {}
        }
        // remove stale (> 20s)
        list = list.filter((it) => now - it.lastSeen < 20000);
        // upsert our client
        const idx = list.findIndex((it) => it.id === entry.id);
        if (idx >= 0) list[idx] = entry; else list.push(entry);
        localStorage.setItem(key, JSON.stringify(list));
        // notify others
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        /* noop */
      }
    };

    const updateCount = () => {
      try {
        const raw = localStorage.getItem(key);
        const list: { id: string; lastSeen: number }[] = raw ? JSON.parse(raw) : [];
        const now = Date.now();
        const fresh = list.filter((it) => now - it.lastSeen < 20000);
        setCount(Math.max(1, fresh.length));
      } catch {
        setCount(1);
      }
    };

    const tick = setInterval(heartbeat, 5000);
    heartbeat();
    updateCount();

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) updateCount();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(tick);
      window.removeEventListener("storage", onStorage);
      if (disposed) return;
      try {
        const raw = localStorage.getItem(key);
        const list: { id: string; lastSeen: number }[] = raw ? JSON.parse(raw) : [];
        const next = list.filter((it) => it.id !== clientIdRef.current);
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {}
      disposed = true;
    };
  }, [noteId]);

  const label = useMemo(() => {
    if (count <= 1) return "You";
    const others = count - 1;
    return `${others} other${others > 1 ? "s" : ""} viewing`;
  }, [count]);

  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
      {label}
    </span>
  );
}
