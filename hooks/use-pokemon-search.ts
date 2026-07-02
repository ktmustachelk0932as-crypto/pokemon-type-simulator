/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import { useEffect, useRef, useState } from "react";

export type PokemonSuggestion = { name: string; types: string[] };

/** ポケモン名のインクリメンタル検索（300msデバウンス）を担うフック */
export function usePokemonSearch() {
  const [searchTerm, setSearchTermState] = useState("");
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const isSelecting = useRef(false);

  useEffect(() => {
    const fetchPokemon = async () => {
      if (searchTerm.trim().length < 1 || isSelecting.current) {
        isSelecting.current = false;
        return;
      }
      try {
        const res = await fetch(`/api/pokemon?q=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("API Fetch Error:", error);
      }
    };
    const timer = setTimeout(fetchPokemon, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const setSearchTerm = (value: string) => {
    isSelecting.current = false;
    setSearchTermState(value);
  };

  const selectSuggestion = (name: string) => {
    isSelecting.current = true;
    setSearchTermState(name);
    setSuggestions([]);
  };

  return { searchTerm, suggestions, setSearchTerm, selectSuggestion };
}
