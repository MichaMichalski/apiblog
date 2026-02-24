import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getThemeFromDB, saveThemeToDB } from "@/lib/theme";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const theme = await getThemeFromDB();
    return NextResponse.json(theme);
  } catch {
    return NextResponse.json({ error: "Failed to load theme" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.version || !body.colors || !body.fonts) {
      return NextResponse.json(
        { error: "Invalid theme structure. Required: version, colors, fonts" },
        { status: 400 }
      );
    }

    await saveThemeToDB(body);
    revalidateAll();

    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
