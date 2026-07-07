import {
  DETAIL_BUCKETS,
  detailBucketOf,
  detailBucketUrl,
  SUBJECT_INDEX_URL,
  type SubjectDetail,
  type SubjectIndex,
} from "./subject";

/**
 * Client-side loaders for the static data artifacts. Artifacts are immutable
 * between daily rebuilds, so caching resolved buckets in memory for the
 * session is enough — the CDN handles cross-session caching.
 */

export async function fetchSubjectIndex(): Promise<SubjectIndex[]> {
  const res = await fetch(SUBJECT_INDEX_URL);
  if (!res.ok) throw new Error(`Failed to load subject index (${res.status})`);
  return res.json();
}

type DetailBucket = Record<string, SubjectDetail>;

const bucketCache = new Map<number, Promise<DetailBucket>>();

function fetchBucket(bucket: number): Promise<DetailBucket> {
  const cached = bucketCache.get(bucket);
  if (cached) return cached;

  const request = fetch(detailBucketUrl(bucket)).then((res) => {
    if (!res.ok) throw new Error(`Failed to load detail bucket ${bucket} (${res.status})`);
    return res.json() as Promise<DetailBucket>;
  });
  // Cache the promise (not the value) so concurrent opens share one request;
  // evict on failure so a transient error doesn't poison the cache.
  request.catch(() => bucketCache.delete(bucket));
  bucketCache.set(bucket, request);
  return request;
}

export async function fetchSubjectDetail(id: number): Promise<SubjectDetail> {
  const bucket = await fetchBucket(detailBucketOf(id));
  const detail = bucket[id.toString()];
  if (!detail) throw new Error(`Subject ${id} not found in its detail bucket`);
  return detail;
}

/**
 * Warm every detail bucket during browser idle time, one at a time. After
 * this finishes the whole database lives in memory and every detail view
 * opens instantly — the "feels local" experience of the old single-file
 * design, without blocking first paint on it.
 */
export function prefetchAllDetails(): void {
  let next = 0;

  const idle = (task: () => void) =>
    "requestIdleCallback" in window ? requestIdleCallback(task) : setTimeout(task, 500);

  const pump = () => {
    if (next >= DETAIL_BUCKETS) return;
    const bucket = next++;
    // Swallow errors: prefetching is opportunistic, the on-demand path
    // retries with proper error surfacing when the user actually opens one.
    fetchBucket(bucket).catch(() => {});
    idle(pump);
  };

  idle(pump);
}
