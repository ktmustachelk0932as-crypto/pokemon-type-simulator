/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

"use client";

import { useMemo, useState } from "react";
import { BaseStats } from "@/components/base-stats";
import { EffectivenessResults } from "@/components/effectiveness-results";
import { PokemonAbilities } from "@/components/pokemon-abilities";
import { PokemonSearchBox } from "@/components/pokemon-search-box";
import { TypeSelector } from "@/components/type-selector";
import { usePokemonSearch, type PokemonSuggestion } from "@/hooks/use-pokemon-search";
import { getWeaknessCategories, groupResultsByCategory } from "@/lib/type-chart";

export default function PokemonTypeCalculator() {
  const [selectedDefenseTypes, setSelectedDefenseTypes] = useState<string[]>(["ノーマル"]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSuggestion | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [activeItems, setActiveItems] = useState<string[]>(() =>
    getWeaknessCategories(["ノーマル"])
  );
  const { searchTerm, suggestions, setSearchTerm, selectSuggestion } = usePokemonSearch();

  const groupedResults = useMemo(
    () => groupResultsByCategory(selectedDefenseTypes, selectedAbility),
    [selectedDefenseTypes, selectedAbility]
  );

  const handleSelectPokemon = (pokemon: PokemonSuggestion) => {
    selectSuggestion(pokemon.name);
    setSelectedPokemon(pokemon);
    setSelectedAbility(null);
    setSelectedDefenseTypes(pokemon.types);

    // 弱点があれば自動展開
    const openItems = getWeaknessCategories(pokemon.types);
    setActiveItems(openItems);
  };

  const handleToggleAbility = (ability: string) => {
    const next = selectedAbility === ability ? null : ability;
    setSelectedAbility(next);

    // 弱点があれば自動展開
    const openItems = getWeaknessCategories(selectedDefenseTypes, next);
    if (openItems.length > 0) setActiveItems(openItems);
  };

  const toggleDefenseType = (type: string) => {
    // タイプを手動で変更したら選択中のポケモン固有の表示（特性・種族値）はクリアする
    setSelectedPokemon(null);
    setSelectedAbility(null);
    setSelectedDefenseTypes((prev) => {
      let next;
      if (prev.includes(type)) {
        next = prev.length > 1 ? prev.filter((t) => t !== type) : prev;
      } else {
        next = prev.length < 2 ? [...prev, type] : [prev[1], type];
      }

      // 弱点があれば自動展開
      const openItems = getWeaknessCategories(next);
      if (openItems.length > 0) setActiveItems(openItems);

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl mx-auto space-y-6">
        <PokemonSearchBox
          searchTerm={searchTerm}
          suggestions={suggestions}
          onSearchTermChange={setSearchTerm}
          onSelectPokemon={handleSelectPokemon}
        />

        <TypeSelector selectedTypes={selectedDefenseTypes} onToggleType={toggleDefenseType} />

        {selectedPokemon?.abilities && selectedPokemon.abilities.length > 0 && (
          <PokemonAbilities
            pokemonName={selectedPokemon.name}
            abilities={selectedPokemon.abilities}
            selectedAbility={selectedAbility}
            onToggleAbility={handleToggleAbility}
          />
        )}

        {selectedPokemon?.stats && (
          <BaseStats pokemonName={selectedPokemon.name} stats={selectedPokemon.stats} />
        )}

        <EffectivenessResults
          groupedResults={groupedResults}
          activeItems={activeItems}
          onActiveItemsChange={setActiveItems}
        />

        <footer className="mt-12 py-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 pokemon-type-simulator | MIT License
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mx-auto">
            Data provided by{" "}
            <a href="https://pokeapi.co/" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">PokeAPI</a>.
          </p>
        </footer>
      </div>
    </div>
  );
}
