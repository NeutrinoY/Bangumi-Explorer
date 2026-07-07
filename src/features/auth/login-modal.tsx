"use client";

import { Loader2, Lock, X } from "lucide-react";
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close admin login"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
        className="relative w-full max-w-xs rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="admin-login-title"
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-400 uppercase"
          >
            <Lock size={14} /> Admin Access
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-9 min-w-9 items-center justify-center"
          >
            <X size={16} className="text-neutral-500 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="mb-2 text-center text-[10px] font-bold tracking-wider text-neutral-600 uppercase">
              Welcome Back
            </div>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              // biome-ignore lint/a11y/noAutofocus: single-field modal; focusing the field is the entire point
              autoFocus
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage("");
              }}
              className={cn(
                "min-h-12 w-full rounded-lg border bg-black px-4 py-3 text-center font-mono tracking-widest text-white transition-all focus:outline-none",
                errorMessage
                  ? "border-red-500 text-red-500 placeholder:text-red-800"
                  : "border-neutral-800 focus:border-pink-500",
              )}
            />
            {errorMessage && (
              <div className="mt-2 animate-pulse text-center text-[10px] font-bold tracking-wider text-red-500">
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white py-2.5 font-bold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "UNLOCK"}
          </button>
        </form>
      </div>
    </div>
  );
}
