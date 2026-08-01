/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import type { PokemonAbility } from "@/hooks/use-pokemon-search";
import { abilityAffectsMatchup } from "@/lib/type-chart";

type PokemonAbilitiesProps = {
  pokemonName: string;
  abilities: PokemonAbility[];
  selectedAbility: string | null;
  onToggleAbility: (ability: string) => void;
};

function HiddenBadge() {
  return (
    <span className="ml-1.5 rounded px-1 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
      隠れ特性
    </span>
  );
}

export function PokemonAbilities({
  pokemonName,
  abilities,
  selectedAbility,
  onToggleAbility,
}: PokemonAbilitiesProps) {
  const hasMatchupAbility = abilities.some((a) => abilityAffectsMatchup(a.name));

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold mb-4">
        特性
        <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
          {pokemonName}
        </span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {abilities.map((ability) => {
          if (!abilityAffectsMatchup(ability.name)) {
            return (
              <span
                key={ability.name}
                className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-sm"
              >
                {ability.name}
                {ability.hidden && <HiddenBadge />}
              </span>
            );
          }

          const isActive = selectedAbility === ability.name;
          return (
            <button
              key={ability.name}
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggleAbility(ability.name)}
              className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              }`}
            >
              {ability.name}
              {ability.hidden && <HiddenBadge />}
            </button>
          );
        })}
      </div>
      {abilities.some((a) => a.description) && (
        <dl className="mt-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3 text-sm">
          {abilities
            .filter((a) => a.description)
            .map((ability) => (
              <div key={ability.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="shrink-0 font-semibold sm:w-32">{ability.name}</dt>
                <dd className="text-slate-600 dark:text-slate-400">{ability.description}</dd>
              </div>
            ))}
        </dl>
      )}
      {hasMatchupAbility && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {selectedAbility
            ? `「${selectedAbility}」をタイプ相性の計算に適用中です。もう一度押すと解除できます。`
            : "青枠の特性はタイプ相性に影響します。押すと相性計算に適用されます。"}
        </p>
      )}
    </section>
  );
}
