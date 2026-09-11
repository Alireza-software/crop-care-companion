import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "My Crop Reports — Fasal Detection" },
      {
        name: "description",
        content:
          "Every crop photo you checked, with the verdict, disease found and the advice given, saved in one place.",
      },
      { property: "og:title", content: "My Crop Reports — Fasal Detection" },
      { property: "og:description", content: "Your saved crop disease reports and advice." },
    ],
  }),
  component: History,
});

type Scan = {
  id: string;
  crop: string;
  image_path: string | null;
  status: string;
  disease: string | null;
  confidence: number;
  severity: string | null;
  feedback: string | null;
  mistakes: unknown;
  treatment: unknown;
  prevention: unknown;
  created_at: string;
};

const asList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

function History() {
  const { user, loading } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }
    let active = true;
    void (async () => {
      const { data } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      const rows = (data ?? []) as Scan[];
      setScans(rows);
      setFetching(false);
      const paths = rows.map((r) => r.image_path).filter(Boolean) as string[];
      if (paths.length) {
        const { data: signed } = await supabase.storage
          .from("crop-photos")
          .createSignedUrls(paths, 3600);
        if (active && signed) {
          const map: Record<string, string> = {};
          signed.forEach((s) => {
            if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
          });
          setUrls(map);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || (user && fetching)) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Your reports live here</h1>
        <p className="mt-3 text-muted-foreground">
          Log in and every crop you check gets saved with its photo and advice.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">Farmer login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">My crop reports</h1>
      <p className="mt-2 text-muted-foreground">
        {scans.length} check{scans.length === 1 ? "" : "s"} saved.
      </p>

      {scans.length === 0 ? (
        <div className="surface-card mt-8 p-8 text-center">
          <p className="text-muted-foreground">No checks yet.</p>
          <Button asChild className="mt-4">
            <Link to="/">Check a crop</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {scans.map((s) => (
            <article key={s.id} className="surface-card overflow-hidden">
              {s.image_path && urls[s.image_path] && (
                <img
                  src={urls[s.image_path]}
                  alt={`${s.crop} checked on ${new Date(s.created_at).toLocaleDateString()}`}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl font-semibold">{s.crop}</span>
                  <Badge
                    className={
                      s.status === "fresh"
                        ? "bg-success text-success-foreground"
                        : s.status === "spoiled"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-warning text-warning-foreground"
                    }
                  >
                    {s.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">{s.confidence}% sure</Badge>
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Disease: </span>
                  {s.disease}
                </p>
                <p className="text-sm leading-relaxed">{s.feedback}</p>
                {asList(s.treatment).length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Treatment & prevention</summary>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      {[...asList(s.mistakes), ...asList(s.treatment), ...asList(s.prevention)].map(
                        (t, i) => (
                          <li key={i}>• {t}</li>
                        ),
                      )}
                    </ul>
                  </details>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
