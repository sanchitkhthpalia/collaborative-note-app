"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface CollaborationState {
  peers: number;
  lastFromUserId?: string;
}

interface Options {
  noteId: string;
  orgId: string;
}

export function useCollaboration({ noteId, orgId }: Options) {
  const { userId } = useCurrentUser();
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<CollaborationState>({ peers: 1 });
  const room = useMemo(() => `org-${orgId}:note-${noteId}`,[orgId, noteId]);

  // connect and join
  useEffect(() => {
    const URL = process.env.NEXT_PUBLIC_COLLAB_SERVER_URL as string;
    if (!URL) return;
    const s = io(URL, { transports: ["websocket"], withCredentials: false });
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("join", { userId, orgId, noteId, room });
    });

    s.on("presence:update", (payload: { room: string; count: number }) => {
      if (payload.room === room) setState((prev) => ({ ...prev, peers: Math.max(1, payload.count) }));
    });

    s.on("content:patch", (payload: { room: string; userId: string; html: string }) => {
      if (payload.room !== room) return;
      setState((prev) => ({ ...prev, lastFromUserId: payload.userId }));
      onRemoteUpdateRef.current?.(payload.html, payload.userId);
    });

    return () => {
      s.emit("leave", { userId, orgId, noteId, room });
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, orgId, noteId]);

  // sending
  const debounceRef = useRef<number | null>(null);
  function sendContent(html: string) {
    const s = socketRef.current;
    if (!s) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      s.emit("content:update", { room, userId, orgId, noteId, html });
    }, 200);
  }

  // consumer sets handler to apply remote patches
  const onRemoteUpdateRef = useRef<(html: string, fromUserId: string) => void>();
  function onRemoteUpdate(handler: (html: string, fromUserId: string) => void) {
    onRemoteUpdateRef.current = handler;
  }

  return {
    peers: state.peers,
    sendContent,
    onRemoteUpdate,
    userId,
    room,
  } as const;
}
