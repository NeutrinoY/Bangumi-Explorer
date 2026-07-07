import { z } from "zod";

/**
 * Schema for one upstream subject file (Jinrxin/bangumi-data, dist/subject/*.json).
 * Deliberately loose: upstream is a scraper we don't control, so everything
 * we can default is optional, and unknown keys pass through unvalidated.
 * A file must still parse as this shape to enter the pipeline; failures are
 * counted and reported by merge.ts instead of aborting the whole run.
 */

const infoboxValue = z.union([z.string(), z.array(z.object({ v: z.string().catch("") }).loose())]);

export const rawSubjectSchema = z
  .object({
    bangumi: z
      .object({
        id: z.number().int().positive(),
        name: z.string().catch(""),
        name_cn: z.string().nullish(),
        summary: z.string().nullish(),
        date: z.string().nullish(),
        air_date: z.string().nullish(),
        platform: z.string().nullish(),
        eps: z.number().nullish(),
        total_episodes: z.number().nullish(),
        images: z
          .object({ common: z.string().catch("") })
          .loose()
          .nullish(),
        rating: z
          .object({
            rank: z.number().nullish(),
            score: z.number().nullish(),
            total: z.number().nullish(),
            count: z.record(z.string(), z.number()).nullish(),
          })
          .loose()
          .nullish(),
        rank: z.number().nullish(),
        collection: z
          .object({
            wish: z.number().catch(0),
            collect: z.number().catch(0),
            doing: z.number().catch(0),
            on_hold: z.number().catch(0),
            dropped: z.number().catch(0),
          })
          .loose()
          .nullish(),
        infobox: z
          .array(z.object({ key: z.string(), value: infoboxValue }).loose())
          .nullish()
          .catch(null),
        tags: z
          .array(z.object({ name: z.string(), count: z.number().catch(0) }).loose())
          .nullish()
          .catch(null),
      })
      .loose()
      .nullish(),
    bangumiData: z
      .object({
        sites: z
          .array(z.object({ site: z.string(), id: z.string().catch("") }).loose())
          .nullish()
          .catch(null),
      })
      .loose()
      .nullish(),
  })
  .loose();

export type RawSubject = z.infer<typeof rawSubjectSchema>;
