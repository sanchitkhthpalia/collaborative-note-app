"use client";

import Link from "next/link";
import { Button } from "@nextui-org/react";
import ThemeToggle from "./ThemeToggle";
import CommandPalette from "./CommandPalette";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              📝 BLOQ QUANTUM
            </span>
            <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">Notes</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <ThemeToggle />
            <Link href="/">
              <Button variant="light" size="sm" className="text-sm">
                All Notes
              </Button>
            </Link>
          </div>
        </div>
        {/* Command Palette mount */}
        <CommandPalette />
      </div>
    </nav>
  );
}
