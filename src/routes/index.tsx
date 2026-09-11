import { createFileRoute, Link } from "@tanstack/react-router";
import { CropScanner } from "@/components/CropScanner";

const HERO = "https://i.pinimg.com/736x/b4/bd/b9/b4bdb94883f6a1455faaf5b24957025a.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fasal Detection — Crop Disease Check for Farmers" },
      {
        name: "description",
        content:
          "Upload a photo of any fruit or vegetable and get an honest fresh-or-spoiled verdict, the disease name, treatment steps and supplier contacts.",
      },
      { property: "og:title", content: "Fasal Detection — Crop Disease Check for Farmers" },
      {
        property: "og:description",
        content:
          "Honest disease detection for fruits and vegetables, with treatment and prevention advice farmers can use the same day.",
      },
      { property: "og:image", content: HERO },
      { name: "twitter:image", content: HERO },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="pb-8">
      <section className="relative overflow-hidden">
        <img src={HERO} alt="Green farm field at harvest time" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 field-gradient opacity-85" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
            For farmers of every field
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold text-primary-foreground sm:text-6xl">
            Know the disease before it eats your harvest.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            Choose your fruit or vegetable, add one photo, and get a straight answer — fresh or
            spoiled, what disease it is, what you did wrong, and exactly what to do to save the
            rest of your crop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#check"
              className="rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
            >
              Check my crop now
            </a>
            <Link
              to="/suppliers"
              className="rounded-full border border-primary-foreground/50 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Find a supplier
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-10 w-full max-w-6xl px-4">
        <div className="surface-card grid gap-4 p-5 sm:grid-cols-3">
          {[
            ["1. Pick the crop", "Sixteen common fruits and vegetables, in English and Urdu."],
            ["2. Add one photo", "Daylight, close up, spots facing the camera."],
            ["3. Get honest advice", "Verdict, treatment, prevention and who to call."],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="font-display text-lg font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <CropScanner />
      </div>

      <section className="mx-auto mt-16 w-full max-w-6xl px-4">
        <div className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Why farmers lose crops</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              [
                "Late spotting",
                "One rotten fruit left in a crate spreads mould through the whole box overnight.",
              ],
              [
                "Wrong watering",
                "Water on the leaves in the evening keeps the plant wet all night and invites blight.",
              ],
              [
                "Blind spraying",
                "Spraying the wrong medicine costs money and leaves the real disease growing.",
              ],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-secondary/50 p-5">
                <p className="font-semibold">{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
