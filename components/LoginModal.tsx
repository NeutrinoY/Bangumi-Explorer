"use client";
import { useState, useEffect } from "react";
import { Lock, X, Loader2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Hidden/Auto-filled Email
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // Use the hardcoded admin email
    const success = await onLogin(adminEmail, password);
    setLoading(false);
    
    if (success) {
      onClose();
    } else {
      setError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} /> Admin Access
          </h2>
          <button onClick={onClose}><X size={16} className="text-neutral-500 hover:text-white" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-2 text-center">
              Welcome Back
            </div>
            <input 
              autoFocus
              type="password" 
              placeholder="Enter Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              className={`w-full bg-black border rounded-lg px-4 py-3 text-center text-white font-mono tracking-widest focus:outline-none transition-all ${error ? "border-red-500 text-red-500 placeholder:text-red-800" : "border-neutral-800 focus:border-pink-500"}`}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "UNLOCK"}
          </button>
        </form>
      </div>
    </div>
  );
}
