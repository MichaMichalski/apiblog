import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getWidgets, saveWidgets, generateWidgetId, getDefaultWidgetSettings, type Widget, type WidgetType } from "@/lib/widgets";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const widgets = await getWidgets();
    return NextResponse.json(widgets);
  } catch {
    return NextResponse.json({ error: "Failed to load widgets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.type || !body.areaId) {
      return NextResponse.json({ error: "Required: type, areaId" }, { status: 400 });
    }

    const widgets = await getWidgets();

    const newWidget: Widget = {
      id: body.id || generateWidgetId(),
      type: body.type as WidgetType,
      areaId: body.areaId,
      sortOrder: body.sortOrder ?? widgets.filter((w) => w.areaId === body.areaId).length,
      settings: body.settings ?? getDefaultWidgetSettings(body.type),
    };

    widgets.push(newWidget);
    await saveWidgets(widgets);
    revalidateAll();

    return NextResponse.json(newWidget, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
