import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">Fasal Detection</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Photo in, honest answer out. Built so a farmer never loses a harvest to a disease he
            could not name.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Pages</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Check a crop</Link></li>
            <li><Link to="/history" className="hover:text-foreground">My reports</Link></li>
            <li><Link to="/suppliers" className="hover:text-foreground">Suppliers</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Help line</p>
          <p className="mt-2 text-muted-foreground">Quetta · +93452659878</p>
          <p className="mt-1 text-muted-foreground">
            Advice is guidance only — for a heavy outbreak call your local agriculture officer.
          </p>
        </div>
      </div>
    </footer>
  );
}
