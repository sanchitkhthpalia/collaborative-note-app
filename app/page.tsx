"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNoteStore } from "@/store/noteStore";
import { Button, Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import { formatTimestamp } from "@/utils/formatTime";

export default function Home() {
  const router = useRouter();
  const { notes, isLoaded, initializeStore } = useNoteStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleCreateNote = () => {
    const newNote = useNoteStore.getState().createNote();
    router.push(`/notes/${newNote.id}`);
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Notes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {notes.length === 0
                ? "Create your first note to get started"
                : `${notes.length} note${notes.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            onPress={handleCreateNote}
            className="note-transition"
          >
            + New Note
          </Button>
        </div>

        {notes.length === 0 ? (
          <Card className="p-12 text-center">
            <CardBody>
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No notes yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first note to start organizing your thoughts
              </p>
              <Button color="primary" size="lg" onPress={handleCreateNote}>
                Create Note
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                isPressable
                onPress={() => handleNoteClick(note.id)}
                className="note-transition hover:scale-105 cursor-pointer"
              >
                <CardHeader className="flex flex-col items-start pb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {note.title}
                  </h3>
                </CardHeader>
                <CardBody className="pt-0">
                  <div
                    className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: note.content || "<em>Empty note</em>",
                    }}
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                    <span>{formatTimestamp(note.updatedAt)}</span>
                    {note.versions.length > 0 && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {note.versions.length} version
                        {note.versions.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

