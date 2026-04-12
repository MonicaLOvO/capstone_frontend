import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
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
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Missing GITHUB_TOKEN environment variable." },
        { status: 500 },
      );
    }

    let extraInput = "";
    try {
      const body = (await request.json()) as { inputData?: string };
      if (typeof body?.inputData === "string" && body.inputData.trim()) {
        extraInput = `\n\n## ADDITIONAL INPUT DATA\n${body.inputData.trim()}\n`;
      }
    } catch {
      /* empty body ok */
    }

    const agentPath = path.join(process.cwd(), "src", "prompts", "Agent.md");
    const agentMarkdown = await readFile(agentPath, "utf-8");
    const userPrompt = `${agentMarkdown}${extraInput}\n\nRespond with ONLY valid JSON matching the OUTPUT RULES (no markdown fences, no commentary). Use realistic sample inventory if INPUT DATA is empty. Include at least 3 recommendations.`;

    const client = ModelClient(endpoint, new AzureKeyCredential(token));
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
