import { NextResponse } from "next/server";
import getDb, { statements as getStatements } from "../../../lib/db";
import { getCachedJournals, setCachedJournals, invalidateJournalsCache } from "../../../lib/cache";

// GET - List all journals (with caching)
export async function GET() {
  try {
    // 1. Try to get from cache first
    const cachedEntries = await getCachedJournals();
    if (cachedEntries) {
      return NextResponse.json({ entries: cachedEntries });
    }

    // 2. Cache miss - fetch from database
    const statements = getStatements();
    const entries = statements.selectAll.all().map((row) => ({
      filename: row.filename,
      date: row.date,
      title: row.title,
      text: row.text,
      categories: JSON.parse(row.categories || "[]"),
      timestamp: row.timestamp,
      pinned: !!row.pinned,
    }));

    // 3. Store in cache for next request
    await setCachedJournals(entries);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: String(error), entries: [] },
      { status: 500 },
    );
  }
}

// POST - Create new journal
export async function POST(req: Request) {
  try {
    const statements = getStatements();
    const body = await req.json();
    const { date, title, text, categories = [] } = body;

    // Create filename from timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}.txt`;

    statements.insert.run(
      filename,
      date,
      title,
      text,
      JSON.stringify(categories),
      timestamp,
      0, // pinned
    );

    // Invalidate cache since we added a new journal
    await invalidateJournalsCache();

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT - Update journal
export async function PUT(req: Request) {
  try {
    const statements = getStatements();
    const body = await req.json();
    const { filename, date, title, text, categories = [], pinned } = body;

    const existing = statements.selectByFilename.get(filename);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    statements.update.run(
      date,
      title,
      text,
      JSON.stringify(categories),
      pinned !== undefined ? pinned : existing.pinned,
      filename,
    );

    // Invalidate cache since we updated a journal
    await invalidateJournalsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH - Toggle pinned
export async function PATCH(req: Request) {
  try {
    const statements = getStatements();
    const body = await req.json();
    const { filename } = body;

    statements.togglePinned.run(filename);

    // Invalidate cache since we modified a journal
    await invalidateJournalsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE - Remove journal
export async function DELETE(req: Request) {
  try {
    const statements = getStatements();
    const body = await req.json();
    const { filename } = body;

    statements.delete.run(filename);

    // Invalidate cache since we deleted a journal
    await invalidateJournalsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
