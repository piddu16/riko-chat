import { NextResponse } from "next/server";
import { mockResponse } from "@/lib/mock-responder";
import type { AssistantMessage, CanvasArtifact } from "@/lib/types";

/** POST /api/chat
 *  Body: { query: string }
 *  Returns: { message: AssistantMessage; canvasArtifacts?: CanvasArtifact[] }
 *  Mock endpoint — will be swapped for a streaming Anthropic call later. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  // Simulate a small latency so the UI's pending state is visible.
  await new Promise((r) => setTimeout(r, 450));

  const { message: base, canvasArtifacts } = mockResponse(query);
  const message: AssistantMessage = {
    ...base,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const payload: { message: AssistantMessage; canvasArtifacts?: CanvasArtifact[] } = { message };
  if (canvasArtifacts && canvasArtifacts.length > 0) {
    payload.canvasArtifacts = canvasArtifacts;
  }
  return NextResponse.json(payload);
}
