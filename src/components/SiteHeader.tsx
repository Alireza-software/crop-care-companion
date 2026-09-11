import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const LOGO = "https://i.pinimg.com/236x/05/8c/02/058c0294f3623aa33082dde283ef44f8.jpg";

const links = [
  { to: "/", label: "Check crop" },
  { to: "/history", label: "My reports" },
  { to: "/suppliers", label: "Suppliers" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={LOGO}
            alt="Fasal Detection logo"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30"
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-foreground">
              Fasal Detection
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Honest crop check
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto md:ml-2">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              Sign out
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">Farmer login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
