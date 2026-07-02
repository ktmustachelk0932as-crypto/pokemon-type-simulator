/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import type { PokemonSuggestion } from "@/hooks/use-pokemon-search";

type PokemonSearchBoxProps = {
  searchTerm: string;
  suggestions: PokemonSuggestion[];
  onSearchTermChange: (value: string) => void;
  onSelectPokemon: (name: string, types: string[]) => void;
};

export function PokemonSearchBox({
  searchTerm,
  suggestions,
  onSearchTermChange,
  onSelectPokemon,
}: PokemonSearchBoxProps) {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold mb-4">ポケモン名で検索</h2>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="例: ピカチュウ"
          className="w-full p-3 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg overflow-hidden">
            {suggestions.map((p) => (
              <button
                key={p.name}
                className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-600 border-b last:border-0 border-slate-100 dark:border-slate-600 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectPokemon(p.name, p.types);
                }}
              >
                <span className="font-bold">{p.name}</span>
                <span className="ml-2 text-xs text-slate-400">({p.types.join("/")})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
