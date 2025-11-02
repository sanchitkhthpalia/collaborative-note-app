"use client";

import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-300 bg-white dark:bg-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📝 BLOQ QUANTUM
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Notes</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="light" size="md">
                All Notes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

