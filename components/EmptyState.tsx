"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`p-10 sm:p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl bg-white dark:bg-gray-800 ${className}`}>
      <div className="flex flex-col items-center">
        {icon ? <div className="text-6xl mb-3">{icon}</div> : null}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
        {description ? (
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-prose mx-auto">{description}</p>
        ) : null}
        {action}
      </div>
    </div>
  );
}
