import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              GazeDash
            </Link>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              demo
            </span>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Sessions
            </NavLink>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </header>

      <Separator />

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
