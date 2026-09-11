import { createServerFn } from "@tanstack/react-start";

export type CropReport = {
  crop: string;
  status: "fresh" | "spoiled" | "at_risk" | "unknown";
  disease: string;
  confidence: number;
  severity: "none" | "low" | "medium" | "high";
  feedback: string;
  mistakes: string[];
  treatment: string[];
  prevention: string[];
  save_other_crops: string[];
};

type Input = { crop: string; imageDataUrl: string };

const SYSTEM = `You are an experienced agriculture inspector helping small farmers.
You look at one photo of a fruit or vegetable and judge it HONESTLY - never flatter the farmer.
If the produce is clearly rotten, mouldy or diseased, say so plainly so the farmer does not lose money by selling or storing it.
Reply as strict json only, matching this shape:
{
 "crop": string (what you actually see; if it differs from the farmer's choice, say the real one),
 "status": "fresh" | "spoiled" | "at_risk" | "unknown",
 "disease": string (disease or defect name, or "None visible"),
 "confidence": number 0-100,
 "severity": "none" | "low" | "medium" | "high",
 "feedback": string (3-4 plain sentences, honest, kind, simple English a farmer can read),
 "mistakes": string[] (2-4 things the farmer likely did wrong that caused this),
 "treatment": string[] (3-5 practical steps, cheap local remedies first, then chemical option with dose guidance),
 "prevention": string[] (3-5 steps for next harvest),
 "save_other_crops": string[] (2-4 urgent steps to protect the rest of the field or stored stock)
}
If the photo is not a fruit or vegetable, set status "unknown" and explain that in feedback.`;

export const analyzeCrop = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    if (!data || typeof data.imageDataUrl !== "string" || !data.imageDataUrl.startsWith("data:")) {
      throw new Error("A crop photo is required.");
    }
    return { crop: String(data.crop ?? "unknown"), imageDataUrl: data.imageDataUrl };
  })
  .handler(async ({ data }): Promise<CropReport> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The farmer says this is: ${data.crop}. Inspect the photo and return the json report.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many checks right now. Please try again in a minute.");
      if (res.status === 402) throw new Error("AI checks are out of credits. Please add credits to continue.");
      throw new Error(`Could not check the photo (${res.status}). ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: Partial<CropReport>;
    try {
      parsed = JSON.parse(raw) as Partial<CropReport>;
    } catch {
      throw new Error("The report could not be read. Please try another photo.");
    }

    const list = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];

    return {
      crop: String(parsed.crop || data.crop),
      status: (["fresh", "spoiled", "at_risk", "unknown"] as const).includes(parsed.status as never)
        ? (parsed.status as CropReport["status"])
        : "unknown",
      disease: String(parsed.disease || "None visible"),
      confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
      severity: (["none", "low", "medium", "high"] as const).includes(parsed.severity as never)
        ? (parsed.severity as CropReport["severity"])
        : "none",
      feedback: String(parsed.feedback || "No clear reading from this photo."),
      mistakes: list(parsed.mistakes),
      treatment: list(parsed.treatment),
      prevention: list(parsed.prevention),
      save_other_crops: list(parsed.save_other_crops),
    };
  });
