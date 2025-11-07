"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { Button } from "@nextui-org/react";

interface RichTextEditorProps {
  content: string;
  onContentChangeAction: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onContentChangeAction,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onContentChangeAction(editor.getHTML());
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900 p-2 md:p-3 flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={editor.isActive("bold") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleBold().run()}
          className="min-w-8"
        >
          <span className="font-bold">B</span>
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("italic") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleItalic().run()}
          className="min-w-8"
        >
          <span className="italic">I</span>
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("strike") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleStrike().run()}
          className="min-w-8"
        >
          <span className="line-through">S</span>
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="min-w-8"
        >
          <span className="font-bold">H1</span>
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="min-w-8"
        >
          <span className="font-bold">H2</span>
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="min-w-8"
        >
          <span className="font-bold">H3</span>
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          size="sm"
          variant={editor.isActive("bulletList") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          className="min-w-8"
        >
          <span>• List</span>
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("orderedList") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
          className="min-w-8"
        >
          <span>1. List</span>
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          size="sm"
          variant={editor.isActive("codeBlock") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleCodeBlock().run()}
          className="min-w-8"
        >
          <span>&lt;/&gt;</span>
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("blockquote") ? "solid" : "ghost"}
          onPress={() => editor.chain().focus().toggleBlockquote().run()}
          className="min-w-8"
        >
          <span>&quot;</span>
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-4 md:p-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

