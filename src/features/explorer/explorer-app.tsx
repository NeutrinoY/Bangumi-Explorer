"use client";

import { Lock, Search, Unlock } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { LoginModal } from "@/features/auth/login-modal";
import { useAdmin } from "@/features/auth/use-admin";
import { useCollection } from "@/features/collection/use-collection";
import { fetchSubjectIndex, prefetchAllDetails } from "@/shared/data/loaders";
import type { SubjectIndex } from "@/shared/data/subject";
import { AnimeCard } from "./components/anime-card";
import { DetailModal } from "./components/detail-modal";
import { FilterPanel } from "./components/filter-panel";
import { Pagination } from "./components/pagination";
import { useExplorer } from "./use-explorer";

interface ExplorerAppProps {
  /** First page of default-ordered subjects, statically rendered by the server. */
  initialSubjects: SubjectIndex[];
}

/**
 * The interactive island. The server renders the first page's cards into
 * static HTML via `initialSubjects`; once the full index loads, filtering,
 * search and pagination run instantly over the in-memory array.
 */
export function ExplorerApp({ initialSubjects }: ExplorerAppProps) {
  const [subjects, setSubjects] = useState<readonly SubjectIndex[]>(initialSubjects);
  const [indexReady, setIndexReady] = useState(false);
  const [indexFailed, setIndexFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSubjectIndex().then(
      (data) => {
        if (cancelled) return;
        setSubjects(data);
        setIndexReady(true);
        // With the index in hand, quietly warm the detail buckets so the
        // whole database ends up in memory — every later interaction is local.
        prefetchAllDetails();
      },
      () => {
        if (!cancelled) setIndexFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const { user, isAdmin, login, logout } = useAdmin();
  const { getStatus, updateStatus } = useCollection(user);
  const explorer = useExplorer(subjects, getStatus);
  const { state, dispatch, results, visible, page, totalPages } = explorer;

  const [selected, setSelected] = useState<SubjectIndex | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Smooth-scroll to the top when flipping pages.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll reacts to page changes only
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const isFiltering = useMemo(() => results.length !== subjects.length, [results, subjects]);

  return (
    <main className="min-h-dvh bg-neutral-950 pb-20 font-sans text-neutral-300 selection:bg-pink-500 selection:text-white">
      <FilterPanel state={state} dispatch={dispatch} resultCount={results.length} />

      <div className="mx-auto max-w-[1920px] p-4 sm:p-6">
        {visible.length === 0 ? (
          <EmptyState
            pending={!indexReady && !indexFailed && isFiltering}
            failed={indexFailed}
            onReset={() => dispatch({ kind: "reset" })}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {visible.map((subject, index) => (
                <AnimeCard
                  key={subject.id}
                  subject={subject}
                  status={getStatus(subject.id)}
                  isAdmin={isAdmin}
                  onOpen={() => setSelected(subject)}
                  onUpdateStatus={updateStatus}
                  priority={index < 8}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(next) => dispatch({ kind: "page-set", page: next })}
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            subject={selected}
            status={getStatus(selected.id)}
            isAdmin={isAdmin}
            onClose={() => setSelected(null)}
            onUpdateStatus={updateStatus}
          />
        )}
      </AnimatePresence>

      {/* Admin toggle: intentionally subtle in the corner */}
      <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 opacity-30 transition-opacity hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => (isAdmin ? logout() : setShowLogin(true))}
          title={isAdmin ? "Logout" : "Admin Login"}
          aria-label={isAdmin ? "Logout" : "Admin Login"}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-700 bg-black/50 text-neutral-500 shadow-lg transition-all hover:bg-neutral-800 hover:text-white"
        >
          {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
        </button>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={login} />}

      <Toaster theme="dark" position="bottom-center" />
    </main>
  );
}

function EmptyState({
  pending,
  failed,
  onReset,
}: {
  pending: boolean;
  failed: boolean;
  onReset: () => void;
}) {
  // A filtered shared link lands here until the index arrives; show progress
  // rather than a premature "no results".
  if (pending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 font-mono text-neutral-600">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
        <p className="animate-pulse text-xs tracking-widest uppercase">Loading Database…</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-neutral-600">
        <Search size={48} strokeWidth={1} />
        <p>Failed to load the database. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-neutral-600">
      <Search size={48} strokeWidth={1} />
      <p>No results match your criteria.</p>
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 text-sm font-bold tracking-widest text-pink-500 uppercase hover:underline"
      >
        Reset All Filters
      </button>
    </div>
  );
}
