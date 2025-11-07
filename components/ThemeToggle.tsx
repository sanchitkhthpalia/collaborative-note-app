"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";

const THEME_KEY = "theme"; // "light" | "dark"

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored as "light" | "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <Button
      variant="light"
      size="sm"
      onPress={toggleTheme}
      className="text-sm"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
    </Button>
  );
}
