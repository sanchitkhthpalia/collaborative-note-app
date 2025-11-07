"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { useNoteStore } from "@/store/noteStore";

function countWordsFromHtml(html: string) {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(t * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    setValue(0);
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, durationMs]);
  return value;
}

export default function StatsBar() {
  const { notes } = useNoteStore();
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((acc, n) => acc + countWordsFromHtml(n.content), 0);
    const totalVersions = notes.reduce((acc, n) => acc + (n.versions?.length || 0), 0);
    return { totalNotes, totalWords, totalVersions };
  }, [notes]);

  const notesVal = useCountUp(stats.totalNotes);
  const wordsVal = useCountUp(stats.totalWords);
  const versionsVal = useCountUp(stats.totalVersions);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardBody className="py-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Notes</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{notesVal}</div>
        </CardBody>
      </Card>
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardBody className="py-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Words</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{wordsVal}</div>
        </CardBody>
      </Card>
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardBody className="py-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Version Count</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{versionsVal}</div>
        </CardBody>
      </Card>
    </div>
  );
}
