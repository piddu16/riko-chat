import { NextResponse } from "next/server";
import { mockResponse, mockFileResponse } from "@/lib/mock-responder";
import { detectFile, type UploadedFileMeta } from "@/lib/file-detector";
import type { AssistantMessage, CanvasArtifact } from "@/lib/types";

/** POST /api/chat
 *  Two modes — distinguished by request body:
 *    A. Text query:   { query: string }
 *    B. File upload:  { file: { name, size, type, lastModified? }, note?: string }
 *  Both return: { message: AssistantMessage; canvasArtifacts?: CanvasArtifact[] } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // ── Mode B: File upload with auto-detection ──
  if (body.file && typeof body.file === "object") {
    const meta = body.file as UploadedFileMeta;
    if (!meta.name) {
      return NextResponse.json({ error: "file.name required" }, { status: 400 });
    }
    await new Promise((r) => setTimeout(r, 900)); // simulate OCR/parse
    const detection = detectFile(meta);
    const { message: base, canvasArtifacts } = mockFileResponse(meta, detection);
    const message: AssistantMessage = {
      ...base,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const payload: { message: AssistantMessage; canvasArtifacts?: CanvasArtifact[] } = { message };
    if (canvasArtifacts && canvasArtifacts.length > 0) payload.canvasArtifacts = canvasArtifacts;
    return NextResponse.json(payload);
  }

  // ── Mode A: Text query ──
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json({ error: "query or file required" }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 450));
  const { message: base, canvasArtifacts } = mockResponse(query);
  const message: AssistantMessage = {
    ...base,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const payload: { message: AssistantMessage; canvasArtifacts?: CanvasArtifact[] } = { message };
  if (canvasArtifacts && canvasArtifacts.length > 0) payload.canvasArtifacts = canvasArtifacts;
  return NextResponse.json(payload);
}
