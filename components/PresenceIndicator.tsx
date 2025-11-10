"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCollaboration } from "@/hooks/useCollaboration";

interface PresenceIndicatorProps {
  noteId: string;
}

export default function PresenceIndicator({ noteId }: PresenceIndicatorProps) {
  const { orgId } = useCurrentUser();
  const { peers } = useCollaboration({ noteId, orgId });

  const label = useMemo(() => {
    if (peers <= 1) return "You";
    const others = peers - 1;
    return `${others} from your org`;
  }, [peers]);

  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
      {label}
    </span>
  );
}
