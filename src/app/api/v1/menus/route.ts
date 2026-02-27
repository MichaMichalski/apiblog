import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getMenus, saveMenus, type Menu } from "@/lib/menus";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const menus = await getMenus();
    return NextResponse.json(menus);
  } catch {
    return NextResponse.json({ error: "Failed to load menus" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Required: id, name" },
        { status: 400 }
      );
    }

    const menus = await getMenus();

    if (menus.some((m) => m.id === body.id)) {
      return NextResponse.json(
        { error: `Menu with id "${body.id}" already exists` },
        { status: 409 }
      );
    }

    const newMenu: Menu = {
      id: body.id,
      name: body.name,
      items: Array.isArray(body.items) ? body.items : [],
    };

    menus.push(newMenu);
    await saveMenus(menus);
    revalidateAll();

    return NextResponse.json(newMenu, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
