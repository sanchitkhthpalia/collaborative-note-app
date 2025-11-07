"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNoteStore } from "@/store/noteStore";
import { Button, Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import { formatTimestamp } from "@/utils/formatTime";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import NoteCard from "@/components/NoteCard";

export default function Home() {
  const router = useRouter();
  const { notes, isLoaded } = useNoteStore();

  const handleCreateNote = () => {
    const newNote = useNoteStore.getState().createNote();
    router.push(`/notes/${newNote.id}`);
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" label="Loading notes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Notes"
          subtitle={
            notes.length === 0
              ? "Create your first note to get started"
              : `${notes.length} note${notes.length > 1 ? "s" : ""}`
          }
          actions={
            <Button color="primary" size="md" onPress={handleCreateNote} className="shadow-sm">
              + New Note
            </Button>
          }
          className="mb-8"
        />

        {notes.length === 0 ? (
          <EmptyState
            icon={<span>📝</span>}
            title="No notes yet"
            description="Create your first note to start organizing your thoughts"
            action={
              <Button color="primary" size="md" onPress={handleCreateNote} className="shadow-sm">
                Create Note
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                updatedAt={note.updatedAt}
                versionsCount={note.versions.length}
                onPress={handleNoteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB: quick create note */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <Button
          onPress={handleCreateNote}
          aria-label="Create note"
          className="rounded-full shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 h-12"
          size="md"
        >
          + New
        </Button>
      </div>
    </div>
  );
}

