"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNoteStore } from "@/store/noteStore";
import {
  Button,
  Input,
  Spinner,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import { formatTimestamp, getFullDateTime } from "@/utils/formatTime";
import { extractTitle } from "@/utils/extractTitle";
import { debounce } from "@/utils/debounce";

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { currentNote, isLoaded, getNoteById, updateNote, deleteNote, restoreVersion, getVersions, setCurrentNote } =
    useNoteStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Debounced update function to prevent too many saves
  const debouncedUpdate = debounce((id: string, content: string, title: string) => {
    updateNote(id, content, title);
  }, 500);

  useEffect(() => {
    if (!isLoaded) return;

    const note = getNoteById(noteId);
    if (!note) {
      router.push("/");
      return;
    }

    setCurrentNote(noteId);
    setTitle(note.title);
    setContent(note.content);
  }, [noteId, isLoaded, getNoteById, router, setCurrentNote]);

  // Auto-update title when content changes significantly
  useEffect(() => {
    if (currentNote && content) {
      const extractedTitle = extractTitle(content);
      if (extractedTitle !== "Untitled Note" && extractedTitle !== currentNote.title) {
        setTitle(extractedTitle);
      }
    }
  }, [content, currentNote]);

  // Save changes with debounce
  useEffect(() => {
    if (currentNote && (content !== currentNote.content || title !== currentNote.title)) {
      debouncedUpdate(noteId, content, title);
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [content, title, noteId, currentNote, debouncedUpdate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    deleteNote(noteId);
    router.push("/");
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersionId) return;
    setIsRestoring(true);
    restoreVersion(noteId, selectedVersionId);
    setIsRestoring(false);
    onOpenChange();
    setSelectedVersionId(null);
  };

  const versions = getVersions(noteId);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentNote) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="light" onPress={() => router.push("/")}>
            ← Back to Notes
          </Button>
          <div className="flex gap-2">
            <Button variant="light" onPress={onOpen}>
              History
              {versions.length > 0 && (
                <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                  {versions.length}
                </span>
              )}
            </Button>
            <Button color="danger" variant="light" onPress={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        </div>

        <Card className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
          <div className="mb-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              variant="flat"
              classNames={{
                input: "text-2xl font-bold",
                inputWrapper: "bg-transparent",
              }}
            />
          </div>
          <Divider className="my-4" />
          <RichTextEditor content={content} onContentChangeAction={setContent} placeholder="Start typing..." />
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {formatTimestamp(currentNote.updatedAt)}
        </div>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Version History</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Card className="border-2 border-blue-500">
                <CardBody>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Current Version
                    </span>
                    <span className="text-xs text-gray-500">{getFullDateTime(currentNote.updatedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentNote.title}</p>
                </CardBody>
              </Card>

              {versions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No previous versions available
                </p>
              ) : (
                versions.map((version) => (
                  <Card
                    key={version.id}
                    isPressable
                    onPress={() => setSelectedVersionId(version.id)}
                    className={`cursor-pointer transition-all ${
                      selectedVersionId === version.id ? "border-2 border-primary" : ""
                    }`}
                  >
                    <CardBody>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Previous Version
                        </span>
                        <span className="text-xs text-gray-500">{getFullDateTime(version.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{version.title}</p>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onOpenChange}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleRestoreVersion}
              isLoading={isRestoring}
              isDisabled={!selectedVersionId}
            >
              Restore Selected Version
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

