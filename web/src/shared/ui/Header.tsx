import { Link, useLocation} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function NavLink({ to, label}: { to: string; label: string}) {
    const { pathname } = useLocation();
    const active = pathname === to || pathname.startsWith(to + "/");
    return (
        <Button asChild variant = {active ? "default" : "ghost"} size = "sm">
            <Link to={to}>{label}</Link>
        </Button>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
            <div className="mx-auto max-w-5x1 px-4 py-3 flex items-center gap-2">
                <div className="font-semibold">Gazedash</div>
                <Separator orientation="vertical" className="h-5 mx-2"/>
                <nav className="flex gap-2">
                    <NavLink to="/" label="Dashboard"/>
                    <NavLink to="/sessions" label="Sessions"/>
                </nav>
            </div>
        </header>
    );
}