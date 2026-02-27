import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getMenus, saveMenus } from "@/lib/menus";
import { revalidateAll } from "@/lib/revalidate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const menus = await getMenus();
    const menu = menus.find((m) => m.id === id);

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
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
    const menus = await getMenus();
    const index = menus.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    menus[index] = {
      id,
      name: body.name ?? menus[index].name,
      items: Array.isArray(body.items) ? body.items : menus[index].items,
    };

    await saveMenus(menus);
    revalidateAll();

    return NextResponse.json(menus[index]);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const menus = await getMenus();
    const filtered = menus.filter((m) => m.id !== id);

    if (filtered.length === menus.length) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    await saveMenus(filtered);
    revalidateAll();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
