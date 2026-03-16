import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const agentsDir = join(process.cwd(), "lib/reflections/agents");
    const folders = await readdir(agentsDir);

    const agents = [];

    for (const folder of folders) {
      if (folder === "TEMPLATE") continue;

      const identityPath = join(agentsDir, folder, "IDENTITY.md");
      try {
        const identityContent = await readFile(identityPath, "utf-8");
        const firstLine = identityContent.split("\n")[0].replace(/^#\s*/, "").trim();
        
        agents.push({
          value: folder,
          label: firstLine,
        });
      } catch (err) {
        console.error(`Failed to read IDENTITY.md for ${folder}:`, err);
      }
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json({ agents: [] }, { status: 500 });
  }
}
