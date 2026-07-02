/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import { TYPES, TYPE_COLORS } from "@/lib/type-chart";

type TypeSelectorProps = {
  selectedTypes: string[];
  onToggleType: (type: string) => void;
};

export function TypeSelector({ selectedTypes, onToggleType }: TypeSelectorProps) {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold mb-4">相手のタイプ</h2>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            className={`px-4 py-2 rounded font-bold transition-all ${TYPE_COLORS[type]} ${type === "あく" ? "text-white" : "text-slate-900"
              } ${selectedTypes.includes(type)
                ? "ring-4 ring-slate-900 dark:ring-white scale-105 opacity-100"
                : "opacity-40 hover:opacity-60"
              }`}
          >
            {type}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-3">※最大2つまで選択できます</p>
    </section>
  );
}
