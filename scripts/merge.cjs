const fs = require("node:fs");
const path = require("node:path");
const { transformSubject } = require("./merge-transform.cjs");

// Allow overriding via environment variables for CI
// Default: Look for data in ../../dist/subject (for local dev) or override in CI
const SUBJECT_DIR = process.env.SUBJECT_DIR || path.join(__dirname, "../../dist/subject");
// Default: Output to ../public/db.json
const OUTPUT_FILE = process.env.OUTPUT_FILE || path.join(__dirname, "../public/db.json");

console.log(`SUBJECT_DIR: ${SUBJECT_DIR}`);
console.log(`OUTPUT_FILE: ${OUTPUT_FILE}`);

async function merge() {
  console.time("Merge Time");
  console.log("Start processing (Season Support Mode)...");

  try {
    if (!fs.existsSync(SUBJECT_DIR)) {
      console.error(`Error: Subject directory not found: ${SUBJECT_DIR}`);
      process.exit(1);
    }

    const files = await fs.promises.readdir(SUBJECT_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const db = [];
    const errors = [];
    let processed = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(SUBJECT_DIR, file);
      try {
        const content = await fs.promises.readFile(filePath, "utf-8");
        const rawData = JSON.parse(content);
        const item = transformSubject(rawData);
        if (item) {
          db.push(item);
        }
      } catch (err) {
        errors.push({ file, message: err instanceof Error ? err.message : String(err) });
      }

      processed++;
      if (processed % 2000 === 0) process.stdout.write(".");
    }

    // Sort by Rank
    db.sort((a, b) => {
      const rankA = a.rank && a.rank > 0 ? a.rank : 999999;
      const rankB = b.rank && b.rank > 0 ? b.rank : 999999;
      if (rankA !== rankB) return rankA - rankB;
      return b.collection.collect - a.collection.collect;
    });

    console.log("\nWriting database...");
    // Ensure output dir exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(db));

    const stats = await fs.promises.stat(OUTPUT_FILE);
    console.log(`\nDONE!`);
    console.log(`Total Valid Items: ${db.length}`);
    console.log(`Skipped Invalid Files: ${errors.length}`);
    if (errors.length > 0) {
      console.log("First invalid files:");
      errors.slice(0, 5).forEach((error) => {
        console.log(`- ${error.file}: ${error.message}`);
      });
    }
    console.log(`File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.timeEnd("Merge Time");
  } catch (error) {
    console.error("Fatal Error:", error);
    process.exit(1);
  }
}

merge();
