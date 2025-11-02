"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/store/noteStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { initializeStore } = useNoteStore();

  useEffect(() => {
    setMounted(true);
    initializeStore();
  }, [initializeStore]);

  if (!mounted) {
    return null;
  }

  return <NextUIProvider>{children}</NextUIProvider>;
}

