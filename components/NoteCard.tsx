"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { formatTimestamp } from "@/utils/formatTime";
import { useNoteStore } from "@/store/noteStore";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  versionsCount: number;
  pinned?: boolean;
  onPressAction: (id: string) => void;
}

export default function NoteCard({ id, title, content, updatedAt, versionsCount, pinned, onPressAction }: NoteCardProps) {
  const { togglePin } = useNoteStore();

  const handleCardPress = () => onPressAction(id);
  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(id);
  };

  return (
    <Card
      isPressable
      onPress={handleCardPress}
      className="note-transition hover:translate-y-[-2px] hover:shadow-md cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-xl"
    >
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between w-full gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
          <button
            onClick={handlePin}
            aria-label={pinned ? "Unpin note" : "Pin note"}
            className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md border border-transparent hover:border-gray-300 dark:hover:border-gray-600 ${
              pinned ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"
            }`}
            title={pinned ? "Unpin" : "Pin"}
          >
            <span>📌</span>
          </button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div
          className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3"
          dangerouslySetInnerHTML={{ __html: content || "<em>Empty note</em>" }}
        />
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
          <span>{formatTimestamp(updatedAt)}</span>
          {versionsCount > 0 && (
            <span className="text-blue-600 dark:text-blue-400">
              {versionsCount} version{versionsCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
