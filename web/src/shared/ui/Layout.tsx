import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-semibold tracking-tight">
            GazeDash
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                isActive
                  ? "font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Sessions
            </NavLink>
          </nav>
        </div>
      </header>

      <Separator />

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
