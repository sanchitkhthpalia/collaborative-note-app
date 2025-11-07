"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Input, Button } from "@nextui-org/react";
import { useNoteStore } from "@/store/noteStore";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const router = useRouter();
  const { notes } = useNoteStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // keyboard shortcut Ctrl/Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes.slice(0, 8);
    return notes
      .filter((n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content && n.content.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [notes, query]);

  const goToNote = (id: string) => {
    setOpen(false);
    router.push(`/notes/${id}`);
  };

  const createNote = () => {
    const newNote = useNoteStore.getState().createNote();
    setOpen(false);
    router.push(`/notes/${newNote.id}`);
  };

  const toggleTheme = () => {
    window.dispatchEvent(new CustomEvent("toggle-theme"));
  };

  return (
    <>
      <Modal isOpen={open} onOpenChange={(v) => setOpen(v)} size="lg" backdrop="blur">
        <ModalContent>
          <ModalHeader className="pb-0">Command Palette</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search notes or type a command..."
              />

              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={createNote}>+ Create Note</Button>
                <Button size="sm" variant="flat" onPress={toggleTheme}>Toggle Theme</Button>
              </div>

              <div className="max-h-80 overflow-auto divide-y divide-gray-100 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                {results.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No results</div>
                ) : (
                  results.map((n) => (
                    <button
                      key={n.id}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                      onClick={() => goToNote(n.id)}
                    >
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{n.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1" dangerouslySetInnerHTML={{ __html: n.content || "<em>Empty</em>" }} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
