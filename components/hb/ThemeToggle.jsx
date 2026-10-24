"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ compact = false }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("hb-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const next = saved ? saved === "dark" : Boolean(prefersDark);
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("hb-theme", next ? "dark" : "light");
  }
  return <button type="button" onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"} className={compact ? "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800" : "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}<span className={compact ? "sr-only" : ""}>{dark ? "Light" : "Dark"}</span></button>;
}
