import { NextResponse } from "next/server";
import db from "../../../lib/supabase-db";
import { getCachedJournals, setCachedJournals, invalidateJournalsCache } from "../../../lib/cache";

export async function GET() {
  try {
    const cachedEntries = await getCachedJournals();
    if (cachedEntries) {
      return NextResponse.json({ entries: cachedEntries });
    }

    const rows = await db.selectAll();
    const entries = rows.map((row) => ({
      id: row.id,
      date: row.date,
      title: row.title,
      text: row.text,
      categories: JSON.parse(row.categories || "[]"),
      pinned: !!row.pinned,
      created_at: row.created_at || new Date().toISOString(),
    }));

    await setCachedJournals(entries);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, title, text, categories = [] } = body;

    const result = await db.insert(date, title, text, JSON.stringify(categories));
    await invalidateJournalsCache();

    return NextResponse.json({ success: true, id: result!.id }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, date, title, text, categories = [], pinned } = body;

    const existing = await db.selectById(id);
    if (!existing) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    await db.update(
      id,
      date,
      title,
      text,
      JSON.stringify(categories),
      pinned !== undefined ? pinned : existing.pinned,
    );

    await invalidateJournalsCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    await db.togglePinned(id);
    await invalidateJournalsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    await db.delete(id);
    await invalidateJournalsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
