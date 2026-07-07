import fs from "node:fs/promises";
import path from "node:path";
import { PAGE_SIZE } from "@/features/explorer/domain/state";
import { ExplorerApp } from "@/features/explorer/explorer-app";
import type { SubjectIndex } from "@/shared/data/subject";

/**
 * Server component: reads the pre-sorted subject index at build time and
 * statically renders the default view's first page, so visitors see content
 * immediately instead of a loading spinner. The client island then fetches
 * the full index and takes over with instant local filtering.
 *
 * The page rebuilds daily via the data-update CI, keeping this static
 * snapshot in step with the artifacts.
 */
export default async function Home() {
  const indexPath = path.join(process.cwd(), "public/data/index.json");
  const subjects: SubjectIndex[] = JSON.parse(await fs.readFile(indexPath, "utf-8"));

  // Artifacts are rank-sorted (the default order); the first page is all
  // the static shell needs — the island replaces it wholesale.
  return <ExplorerApp initialSubjects={subjects.slice(0, PAGE_SIZE)} />;
}
