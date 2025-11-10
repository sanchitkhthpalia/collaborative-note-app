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
import LiveEditor from "@/components/LiveEditor";
import { formatTimestamp, getFullDateTime } from "@/utils/formatTime";
import { extractTitle } from "@/utils/extractTitle";
import { debounce } from "@/utils/debounce";
import PresenceIndicator from "@/components/PresenceIndicator";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  const { orgId } = useCurrentUser();

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

    // org guard: block access if not same org
    if (note.orgId && orgId && note.orgId !== orgId) {
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="light" onPress={() => router.push("/")}>
              ← Back to Notes
            </Button>
            <PresenceIndicator noteId={noteId} />
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="light" onPress={onOpen}>
              History
              {versions.length > 0 && (
                <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                  {versions.length}
                </span>
              )}
            </Button>
            <Button variant="light" onPress={() => exportMarkdown(title, content)}>
              Export .md
            </Button>
            <Button variant="light" onPress={() => exportPDF(title, content)}>
              Export PDF
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
          <LiveEditor noteId={noteId} orgId={orgId || "org-alpha"} content={content} onLocalChangeAction={setContent} />
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


// --- Export helpers (module scope) ---
function htmlToMarkdown(html: string): string {
  let s = html || "";
  s = s.replace(/\n/g, "");
  s = s.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  s = s.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  s = s.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  s = s.replace(/<strong>|<b>/gi, "**").replace(/<\/strong>|<\/b>/gi, "**");
  s = s.replace(/<em>|<i>/gi, "*").replace(/<\/em>|<\/i>/gi, "*");
  s = s.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (m, p1) => `\n\n\
\`\`\`\n${p1}\n\`\`\`\n\n`);
  s = s.replace(/<code>(.*?)<\/code>/gi, "`$1`");
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (m, p1) => p1.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n") + "\n");
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (m, p1) => {
    let i = 1;
    return p1.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match: string, item: string) => `${i++}. ${item}\n`) + "\n";
  });
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, p1) => p1.split(/\n/).map((l: string) => "> " + l).join("\n") + "\n\n");
  s = s.replace(/<br\s*\/?>(\s*)/gi, "\n");
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  s = s.replace(/<[^>]+>/g, "");
  return s.trim() + "\n";
}

function downloadFile(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportMarkdown(title: string, html: string) {
  const md = htmlToMarkdown(html);
  const safe = (title || "note").replace(/[^a-z0-9\-]+/gi, "-").toLowerCase();
  downloadFile(`${safe || "note"}.md`, md, "text/markdown");
}

function exportPDF(title: string, html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  const doc = win.document;
  doc.write(`<!doctype html><html><head><meta charset='utf-8'><title>${title || "Note"}</title>
  <style>
    body{font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding:32px; color:#111}
    h1,h2,h3{margin:16px 0 8px}
    .content{max-width:800px;margin:0 auto}
    pre{background:#f5f5f5;padding:12px;border-radius:8px;overflow:auto}
    code{background:#f0f0f0;padding:2px 4px;border-radius:4px}
  </style></head><body>
  <div class='content'>${html}</div>
  </body></html>`);
  doc.close();
  win.focus();
  win.print();
}
