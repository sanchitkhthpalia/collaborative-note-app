import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","), credentials: false }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
    credentials: false,
  },
});

// presence map per room
// room -> Map<userId, lastSeenMs>
const presence: Map<string, Map<string, number>> = new Map();

function roomKey(orgId: string, noteId: string) {
  return `org-${orgId}:note-${noteId}`;
}

function updatePresence(room: string, userId: string) {
  let m = presence.get(room);
  if (!m) {
    m = new Map();
    presence.set(room, m);
  }
  m.set(userId, Date.now());
}

function prunePresence(room: string) {
  const m = presence.get(room);
  if (!m) return 0;
  const now = Date.now();
  for (const [uid, ts] of m.entries()) {
    if (now - ts > 20000) m.delete(uid);
  }
  return m.size || 0;
}

io.on("connection", (socket) => {
  let joinedRoom: string | null = null;
  let currentUserId: string | null = null;

  socket.on("join", (payload: { userId: string; orgId: string; noteId: string; room?: string }) => {
    const { userId, orgId, noteId } = payload;
    const room = payload.room || roomKey(orgId, noteId);
    currentUserId = userId;
    joinedRoom = room;
    socket.join(room);
    updatePresence(room, userId);
    const count = prunePresence(room);
    io.to(room).emit("presence:update", { room, count });
  });

  socket.on("presence:heartbeat", (payload: { orgId: string; noteId: string; userId: string }) => {
    const { orgId, noteId, userId } = payload;
    const room = roomKey(orgId, noteId);
    updatePresence(room, userId);
    const count = prunePresence(room);
    io.to(room).emit("presence:update", { room, count });
  });

  socket.on("content:update", (payload: { room?: string; orgId: string; noteId: string; userId: string; html: string }) => {
    const { orgId, noteId, userId, html } = payload;
    const room = payload.room || roomKey(orgId, noteId);
    // broadcast to others in room (not sender)
    socket.to(room).emit("content:patch", { room, userId, html });
  });

  socket.on("leave", (payload: { orgId: string; noteId: string; userId: string; room?: string }) => {
    const { orgId, noteId, userId } = payload;
    const room = payload.room || roomKey(orgId, noteId);
    socket.leave(room);
    const m = presence.get(room);
    if (m) {
      m.delete(userId);
      const count = prunePresence(room);
      io.to(room).emit("presence:update", { room, count });
    }
  });

  socket.on("disconnect", () => {
    if (joinedRoom && currentUserId) {
      const m = presence.get(joinedRoom);
      if (m) {
        m.delete(currentUserId);
        const count = prunePresence(joinedRoom);
        io.to(joinedRoom).emit("presence:update", { room: joinedRoom, count });
      }
    }
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

httpServer.listen(PORT, () => {
  console.log(`collab-server listening on :${PORT}`);
});
