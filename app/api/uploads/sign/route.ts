import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createSignedUploadUrl, UploadValidationError } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_FOLDERS = new Set([
  "profiles",
  "businesses",
  "events",
  "stories",
  "moments",
  "countries",
  "family-branches",
]);

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const limit = rateLimit(`upload:${session.user.id}`, 30, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.folder !== "string" || !ALLOWED_FOLDERS.has(body.folder)) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  try {
    const result = await createSignedUploadUrl({
      folder: body.folder,
      contentType: body.contentType,
      sizeBytes: body.sizeBytes,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not prepare upload." }, { status: 500 });
  }
}
