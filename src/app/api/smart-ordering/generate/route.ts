import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { fetchInventoryForPrompt } from "@/lib/smartOrdering/fetchInventoryForPrompt";
import {
  extractJsonObject,
  mapAiItemToRow,
  type AiRecommendationItem,
} from "@/lib/smartOrdering/mapAiRecommendations";
import type { SmartOrderingRow } from "@/services/api/smart-ordering/smartOrdering.types";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function POST(request: Request) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { error: "Missing GITHUB_TOKEN environment variable." },
        { status: 500 },
      );
    }

    let extraInput = "";
    let hasLiveInventory = false;
    const authHeader = request.headers.get("authorization");

    try {
      const body = (await request.json()) as { inputData?: string };
      if (authHeader?.trim()) {
        const inv = await fetchInventoryForPrompt(authHeader);
        if (!inv.ok) {
          return NextResponse.json({ error: inv.message }, { status: inv.status });
        }
        extraInput = `\n\n## INPUT DATA\n${inv.text}\n`;
        hasLiveInventory = true;
      } else if (typeof body?.inputData === "string" && body.inputData.trim()) {
        extraInput = `\n\n## ADDITIONAL INPUT DATA\n${body.inputData.trim()}\n`;
      }
    } catch {
      /* empty body ok */
      if (authHeader?.trim()) {
        const inv = await fetchInventoryForPrompt(authHeader);
        if (!inv.ok) {
          return NextResponse.json({ error: inv.message }, { status: inv.status });
        }
        extraInput = `\n\n## INPUT DATA\n${inv.text}\n`;
        hasLiveInventory = true;
      }
    }

    const agentPath = path.join(process.cwd(), "src", "prompts", "Agent.md");
    const agentMarkdown = await readFile(agentPath, "utf-8");
    const tailInstruction = hasLiveInventory
      ? "Respond with ONLY valid JSON matching the OUTPUT RULES (no markdown fences, no commentary). Base every recommendation on the INPUT DATA inventory only: use real sku and item_name from the list. Where max_capacity or reorder context is missing, infer reasonable values from current_stock and category. Include at least 3 recommendations when there are at least 3 items; otherwise recommend for each item present."
      : "Respond with ONLY valid JSON matching the OUTPUT RULES (no markdown fences, no commentary). Use realistic sample inventory if INPUT DATA is empty. Include at least 3 recommendations.";
    const userPrompt = `${agentMarkdown}${extraInput}\n\n${tailInstruction}`;

    const client = ModelClient(endpoint, new AzureKeyCredential(githubToken));
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content:
              "You are a data generator for a warehouse UI. Output only valid JSON as specified by the user. Never wrap in markdown code fences.",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        top_p: 1.0,
        model,
      },
    });

    if (isUnexpected(response)) {
      const errBody = response.body as { error?: { message?: string } };
      return NextResponse.json(
        { error: errBody?.error?.message || "Model request failed." },
        { status: 500 },
      );
    }

    const okBody = response.body as {
      choices?: { message?: { content?: string } }[];
    };
    const rawText =
      okBody.choices?.[0]?.message?.content || "No response text returned.";

    let parsed: unknown;
    try {
      parsed = extractJsonObject(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "Model did not return valid JSON.",
          debugSnippet: rawText.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const recs = extractRecommendations(parsed);
    const rows: SmartOrderingRow[] = recs.map((item, i) =>
      mapAiItemToRow(item, i),
    );

    return NextResponse.json({ rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function extractRecommendations(parsed: unknown): AiRecommendationItem[] {
  if (!parsed || typeof parsed !== "object") return [];
  const o = parsed as Record<string, unknown>;
  if (Array.isArray(o.recommendations)) {
    return o.recommendations as AiRecommendationItem[];
  }
  if (Array.isArray(o.Recommendations)) {
    return o.Recommendations as AiRecommendationItem[];
  }
  if (Array.isArray(o.data)) {
    return o.data as AiRecommendationItem[];
  }
  return [];
}
