"use client";
import { useState, useEffect } from "react";
import { Lock, X } from "lucide-react";

export function LoginModal({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (code: string) => boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(code)) {
      onClose();
    } else {
      setError(true);
      setCode("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} /> Admin Access
          </h2>
          <button onClick={onClose}><X size={16} className="text-neutral-500 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            autoFocus
            type="password" 
            placeholder="Enter Code"
            value={code}
            onChange={e => { setCode(e.target.value); setError(false); }}
            className={`w-full bg-black border rounded-lg px-4 py-3 text-center font-mono tracking-widest focus:outline-none transition-all ${error ? "border-red-500 text-red-500 placeholder:text-red-800" : "border-neutral-800 text-white focus:border-pink-500"}`}
          />
          <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors">
            UNLOCK
          </button>
        </form>
      </div>
    </div>
  );
}
