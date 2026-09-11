import { createFileRoute } from "@tanstack/react-router";
import { SUPPLIERS } from "@/lib/suppliers";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers & Treatment Sellers — Fasal Detection" },
      {
        name: "description",
        content:
          "Contact numbers for local suppliers of sprays, seed, compost and cold storage so farmers can act on their crop report the same day.",
      },
      { property: "og:title", content: "Suppliers & Treatment Sellers — Fasal Detection" },
      {
        property: "og:description",
        content: "Local supplier contacts for sprays, seed, compost and storage.",
      },
    ],
  }),
  component: Suppliers,
});

function Suppliers() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Suppliers you can call today</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Once your report names the treatment, these suppliers can provide the spray, seed or
        storage you need. Tell them the disease name from your report.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {SUPPLIERS.map((s) => (
          <div key={s.name} className="surface-card flex flex-col p-6">
            <p className="font-display text-xl font-semibold">{s.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {s.role} · {s.city}
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {s.supplies.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
            <Button asChild className="mt-6">
              <a href={`tel:${s.phone}`}>Call {s.phone}</a>
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        These listings are samples using the contact you gave us — send me the real names and
        numbers and I will replace them.
      </p>
    </div>
  );
}
