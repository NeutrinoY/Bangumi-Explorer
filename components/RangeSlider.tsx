"use client";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export function RangeSlider({ min, max, value, onChange, step = 1 }: RangeSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs text-neutral-400 font-mono">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
      <div className="relative h-2 bg-neutral-700 rounded-full">
        {/* Track */}
        <div
          className="absolute h-full bg-pink-500 rounded-full opacity-50"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
          }}
        />
        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (v <= value[1]) onChange([v, value[1]]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (v >= value[0]) onChange([value[0], v]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Visual Thumbs */}
        <div 
            className="absolute h-4 w-4 bg-white rounded-full shadow-md top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${((value[0] - min) / (max - min)) * 100}%` }}
        />
        <div 
            className="absolute h-4 w-4 bg-white rounded-full shadow-md top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}
