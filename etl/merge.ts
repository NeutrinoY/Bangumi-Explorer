import fs from "node:fs";
import path from "node:path";
import { DETAIL_BUCKETS, detailBucketOf } from "../src/shared/data/subject";
import { rawSubjectSchema } from "./schemas";
import { type TransformedSubject, transformSubject } from "./transform";

/**
 * ETL entry point. Reads upstream subject files, validates + transforms them,
 * and writes the frontend artifacts:
 *   public/data/index.json       (browse/filter index, one array)
 *   public/data/details-{n}.json (detail records bucketed by id % DETAIL_BUCKETS)
 *
 * Environment overrides (used by CI):
 *   SUBJECT_DIR — upstream dist/subject directory
 *   OUTPUT_DIR  — artifact root (defaults to public/data)
 */

const SUBJECT_DIR = process.env.SUBJECT_DIR ?? path.join(import.meta.dirname, "../../dist/subject");
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? path.join(import.meta.dirname, "../public/data");

interface FailedFile {
  file: string;
  reason: string;
}

async function main(): Promise<void> {
  console.log(`SUBJECT_DIR: ${SUBJECT_DIR}`);
  console.log(`OUTPUT_DIR:  ${OUTPUT_DIR}`);
  console.time("etl");

  if (!fs.existsSync(SUBJECT_DIR)) {
    console.error(`Subject directory not found: ${SUBJECT_DIR}`);
    process.exit(1);
  }

  const files = (await fs.promises.readdir(SUBJECT_DIR)).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} subject files.`);

  // Keyed by id: upstream occasionally ships the same subject twice
  // (observed: id 62893), and duplicate cards would break the frontend.
  const subjects = new Map<number, TransformedSubject>();
  const failed: FailedFile[] = [];
  let skipped = 0;

  for (const file of files) {
    try {
      const content = await fs.promises.readFile(path.join(SUBJECT_DIR, file), "utf-8");
      const raw = rawSubjectSchema.parse(JSON.parse(content));
      const transformed = transformSubject(raw);
      if (transformed) {
        subjects.set(transformed.index.id, transformed);
      } else {
        skipped++; // Below the quality bar (unranked / too few votes) — expected.
      }
    } catch (error) {
      failed.push({ file, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  // Rank order in the artifact = default page order; lets the frontend skip a sort.
  const sorted = [...subjects.values()].sort(
    (a, b) => a.index.rank - b.index.rank || b.index.collect - a.index.collect,
  );

  const detailsDir = OUTPUT_DIR;
  await fs.promises.rm(path.join(OUTPUT_DIR, "details"), { recursive: true, force: true });
  await fs.promises.mkdir(detailsDir, { recursive: true });

  await fs.promises.writeFile(
    path.join(OUTPUT_DIR, "index.json"),
    JSON.stringify(sorted.map((s) => s.index)),
  );

  // Bucket layout: { [id]: SubjectDetail } keyed maps, one file per bucket.
  const buckets = Array.from({ length: DETAIL_BUCKETS }, () => ({}) as Record<string, unknown>);
  for (const s of sorted) {
    buckets[detailBucketOf(s.detail.id)][s.detail.id.toString()] = s.detail;
  }
  await Promise.all(
    buckets.map((bucket, n) =>
      fs.promises.writeFile(path.join(detailsDir, `details-${n}.json`), JSON.stringify(bucket)),
    ),
  );

  const indexSize = (await fs.promises.stat(path.join(OUTPUT_DIR, "index.json"))).size;
  console.log(`Index: ${sorted.length} subjects, ${(indexSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Detail buckets: ${DETAIL_BUCKETS}`);
  console.log(`Skipped (quality bar): ${skipped}`);

  if (failed.length > 0) {
    console.warn(`Failed to process ${failed.length} files:`);
    for (const { file, reason } of failed.slice(0, 10)) {
      console.warn(`  - ${file}: ${reason.split("\n")[0]}`);
    }
    // A few malformed files are tolerable; a large batch means the upstream
    // format changed and the artifacts would be silently wrong — fail loudly.
    if (failed.length > files.length * 0.01) {
      console.error("More than 1% of files failed validation; aborting.");
      process.exit(1);
    }
  }

  console.timeEnd("etl");
}

main();
