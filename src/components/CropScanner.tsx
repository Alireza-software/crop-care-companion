import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CROPS } from "@/lib/crops";
import { analyzeCrop, type CropReport } from "@/lib/analyze.functions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

async function fileToDataUrl(file: File, max = 1100): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read the photo.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const head = dataUrl.slice(0, dataUrl.indexOf(","));
  const body = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const mime = head.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

const STATUS_LABEL: Record<CropReport["status"], string> = {
  fresh: "Fresh — safe to sell",
  spoiled: "Spoiled — do not store with good stock",
  at_risk: "At risk — act today",
  unknown: "Not clear from this photo",
};

export function CropScanner() {
  const { user } = useAuth();
  const analyze = useServerFn(analyzeCrop);
  const inputRef = useRef<HTMLInputElement>(null);

  const [crop, setCrop] = useState("Tomato");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<CropReport | null>(null);
  const [saved, setSaved] = useState(false);

  const onPick = async (file?: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      setReport(null);
      setSaved(false);
    } catch {
      toast.error("That photo could not be opened. Try a JPG or PNG.");
    }
  };

  const run = async (dataUrl: string, cropName: string) => {
    setBusy(true);
    setReport(null);
    setSaved(false);
    try {
      const result = (await analyze({ data: { crop: cropName, imageDataUrl: dataUrl } })) as CropReport;
      setReport(result);
      await save(result, dataUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The check failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (result: CropReport, dataUrl: string) => {
    if (!user) return;
    try {
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage
        .from("crop-photos")
        .upload(path, dataUrlToBlob(dataUrl), { contentType: "image/jpeg" });
      const { error } = await supabase.from("scans").insert({
        user_id: user.id,
        crop: result.crop,
        image_path: up.error ? null : path,
        status: result.status,
        disease: result.disease,
        confidence: result.confidence,
        severity: result.severity,
        feedback: result.feedback,
        mistakes: result.mistakes,
        treatment: result.treatment,
        prevention: [...result.prevention, ...result.save_other_crops],
      });
      if (!error) setSaved(true);
    } catch {
      /* saving is best effort; the report still shows */
    }
  };

  const tone =
    report?.status === "fresh"
      ? "bg-success text-success-foreground"
      : report?.status === "spoiled"
        ? "bg-destructive text-destructive-foreground"
        : report?.status === "at_risk"
          ? "bg-warning text-warning-foreground"
          : "bg-muted text-muted-foreground";

  return (
    <section id="check" className="mx-auto w-full max-w-6xl px-4">
      <div className="surface-card p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Step 1 — pick your fruit or vegetable
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap one, then add a clear daylight photo of the crop.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-8">
          {CROPS.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setCrop(c.name);
                if (preview) void run(preview, c.name);
                else inputRef.current?.click();
              }}
              className={`rounded-2xl border p-3 text-center transition-all ${
                crop === c.name
                  ? "border-primary bg-primary/10 shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="block text-2xl">{c.emoji}</span>
              <span className="mt-1 block text-xs font-medium">{c.name}</span>
              <span className="block text-[11px] text-muted-foreground">{c.urdu}</span>
            </button>
          ))}
        </div>

        <h3 className="mt-8 font-display text-xl font-semibold">Step 2 — add the photo</h3>
        <div className="mt-3 grid gap-5 md:grid-cols-2">
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => void onPick(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/40 transition-colors hover:border-primary"
            >
              {preview ? (
                <img src={preview} alt="Crop to check" className="h-full w-full object-cover" />
              ) : (
                <span className="px-6 text-center text-sm text-muted-foreground">
                  Tap to take or upload a photo of your {crop.toLowerCase()}
                </span>
              )}
            </button>
            <Button
              className="mt-3 w-full"
              size="lg"
              disabled={!preview || busy}
              onClick={() => preview && void run(preview, crop)}
            >
              {busy ? "Checking the crop…" : `Check my ${crop.toLowerCase()}`}
            </Button>
            {!user && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <Link to="/auth" className="underline">
                  Log in
                </Link>{" "}
                to keep every report in your record.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-secondary/40 p-5">
            {!report && !busy && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">What you will get</p>
                <ul className="mt-3 space-y-2">
                  <li>• Fresh or spoiled — said straight, no sugar-coating</li>
                  <li>• The disease or defect name and how sure we are</li>
                  <li>• The mistakes that caused it</li>
                  <li>• Treatment today and how to protect the rest of the field</li>
                </ul>
              </div>
            )}
            {busy && (
              <div className="flex h-full min-h-40 items-center justify-center text-sm text-muted-foreground">
                Looking closely at the skin, colour and spots…
              </div>
            )}
            {report && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>
                    {report.crop}: {STATUS_LABEL[report.status]}
                  </span>
                  <Badge variant="outline">{report.confidence}% sure</Badge>
                  <Badge variant="outline">Severity: {report.severity}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Disease / defect
                  </p>
                  <p className="font-medium">{report.disease}</p>
                </div>
                <p className="text-sm leading-relaxed">{report.feedback}</p>
                {saved && (
                  <p className="text-xs text-muted-foreground">
                    Saved to <Link to="/history" className="underline">your reports</Link>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {report && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ListCard title="What went wrong" items={report.mistakes} accent="bg-destructive/10" />
            <ListCard title="Treatment now" items={report.treatment} accent="bg-primary/10" />
            <ListCard
              title="Save your other crops"
              items={[...report.save_other_crops, ...report.prevention]}
              accent="bg-accent/15"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ListCard({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  if (!items.length) return null;
  return (
    <div className={`rounded-2xl border border-border p-5 ${accent}`}>
      <p className="font-display text-lg font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">▸</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
