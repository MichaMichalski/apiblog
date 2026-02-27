import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getWidgets, saveWidgets } from "@/lib/widgets";
import { revalidateAll } from "@/lib/revalidate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const widgets = await getWidgets();
    const widget = widgets.find((w) => w.id === id);

    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    return NextResponse.json(widget);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const widgets = await getWidgets();
    const index = widgets.findIndex((w) => w.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    widgets[index] = {
      ...widgets[index],
      type: body.type ?? widgets[index].type,
      areaId: body.areaId ?? widgets[index].areaId,
      sortOrder: body.sortOrder ?? widgets[index].sortOrder,
      settings: body.settings ?? widgets[index].settings,
    };

    await saveWidgets(widgets);
    revalidateAll();

    return NextResponse.json(widgets[index]);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const widgets = await getWidgets();
    const filtered = widgets.filter((w) => w.id !== id);

    if (filtered.length === widgets.length) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    await saveWidgets(filtered);
    revalidateAll();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
