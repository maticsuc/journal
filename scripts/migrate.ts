import fs from "fs";
import path from "path";
import db, { statements } from "../lib/db";

const JOURNALS_DIR = process.env.JOURNALS_DIR || "./journals";

// Function to parse a journal file (copied from route.ts)
function parseJournal(filename: string): {
  date: string;
  title: string;
  text: string;
  categories: string[];
} | null {
  try {
    const content = fs.readFileSync(path.join(JOURNALS_DIR, filename), "utf-8");
    const lines = content.split("\n");
    const date = lines[0]?.replace("Date: ", "") || "";
    const title = lines[1]?.replace("Title: ", "") || "";

    let categories: string[] = [];
    let textStartLine = 3;

    if (lines[2]?.startsWith("Categories: ")) {
      const categoriesStr = lines[2].replace("Categories: ", "");
      categories = categoriesStr
        ? categoriesStr.split(",").map((c) => c.trim())
        : [];
      textStartLine = 4;
    }

    const text = lines.slice(textStartLine).join("\n");
    return { date, title, text, categories };
  } catch {
    return null;
  }
}

// Migrate existing files
function migrate() {
  if (!fs.existsSync(JOURNALS_DIR)) {
    console.log("No journals directory found, skipping migration.");
    return;
  }

  const files = fs.readdirSync(JOURNALS_DIR).filter((f) => f.endsWith(".txt"));

  console.log(`Found ${files.length} journal files to migrate.`);

  for (const filename of files) {
    const parsed = parseJournal(filename);
    if (!parsed) {
      console.warn(`Failed to parse ${filename}, skipping.`);
      continue;
    }

    const timestamp = parseInt(filename.replace(".txt", ""), 10);
    statements.insert.run(
      filename,
      parsed.date,
      parsed.title,
      parsed.text,
      JSON.stringify(parsed.categories),
      timestamp,
    );
    console.log(`Migrated ${filename}`);
  }

  console.log("Migration complete.");
}

migrate();
