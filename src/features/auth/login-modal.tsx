"use client";

import { Loader2, Lock, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/shared/ui/cn";
import { useModalBehavior } from "@/shared/ui/use-modal-behavior";

interface LoginModalProps {
  onClose: () => void;
  onLogin: (password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  useModalBehavior(onClose);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await onLogin(password);
    if (result.ok) {
      onClose();
      return;
    }
    setLoading(false);
    setErrorMessage(result.message || "Invalid credentials");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <button
        type="button"
        aria-label="Close admin login"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="admin-login-title"
            className="flex items-center gap-3 text-sm font-bold tracking-widest text-neutral-300 uppercase"
          >
            <span className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-800 bg-black text-neutral-400 shadow-inner">
              <Lock size={15} />
            </span>
            Admin Access
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="mb-2 text-center text-[10px] font-bold tracking-wider text-neutral-600 uppercase">
              Welcome Back
            </div>
            <input
              type="password"
              name="admin-password"
              autoComplete="current-password"
              placeholder="Enter Password"
              value={password}
              // biome-ignore lint/a11y/noAutofocus: single-field modal; focusing the field is the entire point
              autoFocus
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage("");
              }}
              className={cn(
                "min-h-12 w-full rounded-lg border bg-black px-4 py-3 text-center font-mono tracking-widest text-neutral-100 caret-pink-400 shadow-inner shadow-black/40 [color-scheme:dark] transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500/30",
                errorMessage
                  ? "border-red-500 text-red-400 placeholder:text-red-800"
                  : "border-neutral-800 focus:border-pink-500/80",
              )}
            />
            {errorMessage && (
              <div
                aria-live="polite"
                className="mt-2 animate-pulse text-center text-[10px] font-bold tracking-wider text-red-500"
              >
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white py-2.5 font-bold text-black shadow-lg shadow-white/5 transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "UNLOCK"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
