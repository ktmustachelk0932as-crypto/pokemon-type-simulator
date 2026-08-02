/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import type { PokemonStats } from "@/hooks/use-pokemon-search";

const STAT_ROWS: { key: keyof PokemonStats; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "こうげき" },
  { key: "defense", label: "ぼうぎょ" },
  { key: "spAttack", label: "とくこう" },
  { key: "spDefense", label: "とくぼう" },
  { key: "speed", label: "すばやさ" },
];

// 種族値の理論上の最大値（バーのスケール基準）
const MAX_STAT = 255;

type BaseStatsProps = {
  pokemonName: string;
  stats: PokemonStats;
};

export function BaseStats({ pokemonName, stats }: BaseStatsProps) {
  const total = STAT_ROWS.reduce((sum, row) => sum + stats[row.key], 0);

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold mb-4">
        種族値
        <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
          {pokemonName}
        </span>
      </h2>
      <div className="space-y-2.5">
        {STAT_ROWS.map(({ key, label }) => {
          const value = stats[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-sm text-slate-600 dark:text-slate-300">
                {label}
              </span>
              <span className="w-9 shrink-0 text-right text-sm font-semibold tabular-nums">
                {value}
              </span>
              <div
                className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700"
                role="meter"
                aria-label={label}
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={MAX_STAT}
              >
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(Math.min(value, MAX_STAT) / MAX_STAT) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        合計{" "}
        <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{total}</span>
      </p>
    </section>
  );
}
