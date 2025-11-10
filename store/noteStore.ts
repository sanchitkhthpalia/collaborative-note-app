import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface NoteVersion {
  id: string;
  content: string;
  timestamp: number;
  title: string;
  orgId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  versions: NoteVersion[];
  pinned?: boolean;
  orgId?: string;
}

interface NoteStore {
  notes: Note[];
  currentNote: Note | null;
  isLoaded: boolean;

  // Initialization
  initializeStore: () => void;

  // Note CRUD operations
  createNote: (orgId?: string) => Note;
  updateNote: (id: string, content: string, title?: string) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (id: string | null) => void;
  getNoteById: (id: string) => Note | undefined;
  togglePin: (id: string) => void;

  // Version history
  addVersion: (noteId: string, content: string, title: string) => void;
  restoreVersion: (noteId: string, versionId: string) => void;
  getVersions: (noteId: string) => NoteVersion[];
}

// LocalStorage key
const STORAGE_KEY = "collaborative-notes-storage";
const STORAGE_EVENT_KEY = "notes-storage-event";

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,
      isLoaded: false,

      initializeStore: () => {
        // Check if already loaded to prevent multiple initializations
        if (get().isLoaded) return;

        // Load from localStorage
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.state?.notes) {
                set({ notes: parsed.state.notes, isLoaded: true });
              }
            }
          } catch (error) {
            console.error("Error loading notes:", error);
          }

          // Listen for storage events (cross-tab collaboration simulation)
          window.addEventListener("storage", (e) => {
            if (e.key === STORAGE_KEY) {
              try {
                const newData = e.newValue ? JSON.parse(e.newValue) : null;
                if (newData?.state?.notes) {
                  set({ notes: newData.state.notes });
                }
              } catch (error) {
                console.error("Error syncing notes:", error);
              }
            }
          });

          // Listen for custom storage events (same-tab sync)
          window.addEventListener(STORAGE_EVENT_KEY, () => {
            try {
              const stored = localStorage.getItem(STORAGE_KEY);
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.state?.notes) {
                  set({ notes: parsed.state.notes });
                }
              }
            } catch (error) {
              console.error("Error syncing notes:", error);
            }
          });
        }

        set({ isLoaded: true });
      },

      createNote: (orgId?: string) => {
        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: "Untitled Note",
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          versions: [],
          pinned: false,
          orgId,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          currentNote: newNote,
        }));

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_KEY));
        }

        return newNote;
      },

      updateNote: (id: string, content: string, title?: string) => {
        set((state) => {
          const updatedNotes = state.notes.map((note) => {
            if (note.id === id) {
              const updatedNote = {
                ...note,
                content,
                ...(title !== undefined && { title }),
                updatedAt: Date.now(),
              };

              // Add version every 5 minutes or on manual save
              const now = Date.now();
              const lastVersion = note.versions[0];
              const shouldAddVersion =
                !lastVersion || now - lastVersion.timestamp > 5 * 60 * 1000;

              if (shouldAddVersion) {
                updatedNote.versions = [
                  {
                    id: `version-${now}-${Math.random().toString(36).substr(2, 9)}`,
                    content: note.content,
                    title: note.title,
                    timestamp: note.updatedAt,
                    orgId: note.orgId,
                  },
                  ...note.versions,
                ];
              }

              return updatedNote;
            }
            return note;
          });

          const currentNote = updatedNotes.find((n) => n.id === id) || null;

          return {
            notes: updatedNotes,
            currentNote,
          };
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_KEY));
        }
      },

      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        }));

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_KEY));
        }
      },

      setCurrentNote: (id: string | null) => {
        set((state) => ({
          currentNote:
            id === null ? null : state.notes.find((note) => note.id === id) || null,
        }));
      },

      getNoteById: (id: string) => {
        return get().notes.find((note) => note.id === id);
      },

      togglePin: (id: string) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
          currentNote: state.currentNote && state.currentNote.id === id
            ? { ...state.currentNote, pinned: !state.currentNote.pinned }
            : state.currentNote,
        }));

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_KEY));
        }
      },

      addVersion: (noteId: string, content: string, title: string) => {
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id === noteId) {
              const newVersion: NoteVersion = {
                id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content,
                title,
                timestamp: Date.now(),
                orgId: note.orgId,
              };
              return {
                ...note,
                versions: [newVersion, ...note.versions],
              };
            }
            return note;
          }),
        }));

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_KEY));
        }
      },

      restoreVersion: (noteId: string, versionId: string) => {
        set((state) => {
          const note = state.notes.find((n) => n.id === noteId);
          if (!note) return state;

          const version = note.versions.find((v) => v.id === versionId);
          if (!version) return state;

          const updatedNotes = state.notes.map((n) => {
            if (n.id === noteId) {
              return {
                ...n,
                content: version.content,
                title: version.title,
                updatedAt: Date.now(),
              };
            }
            return n;
          });

          return {
            notes: updatedNotes,
            currentNote: updatedNotes.find((n) => n.id === noteId) || null,
          };
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_KEY));
        }
      },

      getVersions: (noteId: string) => {
        const note = get().notes.find((n) => n.id === noteId);
        return note?.versions || [];
      },

      getNotesForOrg: (orgId: string) => {
        return get().notes.filter((n) => n.orgId === orgId);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
