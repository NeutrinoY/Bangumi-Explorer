"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";

interface NumberFieldProps {
  value: number;
  onCommit: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  "aria-label": string;
}

/**
 * Numeric input that keeps local text state while typing and commits on
 * blur/Enter — so half-typed values don't thrash the filter pipeline.
 * inputMode brings up the right mobile keyboard.
 */
export function NumberField({
  value,
  onCommit,
  min,
  max,
  step = 1,
  "aria-label": ariaLabel,
}: NumberFieldProps) {
  const [text, setText] = useState(value.toString());

  // Sync when the committed value changes underneath us (preset, reset, URL).
  useEffect(() => {
    setText(value.toString());
  }, [value]);

  const commit = () => {
    const parsed = Number.parseFloat(text);
    if (Number.isNaN(parsed)) {
      setText(value.toString()); // revert garbage input
      return;
    }
    if (parsed !== value) {
      onCommit(parsed);
    } else {
      setText(value.toString()); // normalize e.g. "08" → "8"
    }
  };

  return (
    <input
      type="number"
      inputMode={step < 1 ? "decimal" : "numeric"}
      step={step}
      min={min}
      max={max}
      value={text}
      aria-label={ariaLabel}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      className={cn(
        "w-full min-h-9 rounded-lg border border-neutral-800 bg-neutral-950/50 px-2 py-1.5",
        "text-center font-mono text-xs text-white placeholder:text-neutral-700",
        "transition-colors focus:border-pink-500/40 focus:bg-neutral-950 focus:outline-none",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      )}
    />
  );
}
