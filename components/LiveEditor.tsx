"use client";

import { useEffect, useRef } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import { useCollaboration } from "@/hooks/useCollaboration";

interface LiveEditorProps {
  noteId: string;
  orgId: string;
  content: string;
  onLocalChangeAction: (html: string) => void;
}

export default function LiveEditor({ noteId, orgId, content, onLocalChangeAction }: LiveEditorProps) {
  const { sendContent, onRemoteUpdate, userId } = useCollaboration({ noteId, orgId });
  const isApplyingRemoteRef = useRef(false);

  useEffect(() => {
    onRemoteUpdate((html) => {
      // prevent loops: mark remote application and set content via callback
      isApplyingRemoteRef.current = true;
      try {
        onLocalChangeAction(html);
      } finally {
        // allow some time for state to propagate before accepting local sends
        setTimeout(() => { isApplyingRemoteRef.current = false; }, 50);
      }
    });
  }, [onRemoteUpdate, onLocalChangeAction]);

  const handleLocalChange = (html: string) => {
    onLocalChangeAction(html);
    if (!isApplyingRemoteRef.current) {
      sendContent(html);
    }
  };

  return (
    <RichTextEditor content={content} onContentChangeAction={handleLocalChange} placeholder="Start typing..." />
  );
}
