"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { formatTimestamp } from "@/utils/formatTime";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  versionsCount: number;
  onPress: (id: string) => void;
}

export default function NoteCard({ id, title, content, updatedAt, versionsCount, onPress }: NoteCardProps) {
  return (
    <Card
      isPressable
      onPress={() => onPress(id)}
      className="note-transition hover:translate-y-[-2px] hover:shadow-md cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-xl"
    >
      <CardHeader className="flex flex-col items-start pb-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
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
