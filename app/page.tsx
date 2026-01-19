/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useMemo, useRef, useState } from "react";

// --- 1. 定数・データ定義 ---

/** 全18タイプの定義 */
const TYPES = [
  "ノーマル", "ほのお", "みず", "でんき", "くさ", "こおり", "かくとう", "どく", "じめん",
  "ひこう", "エスパー", "むし", "いわ", "ゴースト", "ドラゴン", "あく", "はがね", "フェアリー",
] as const;

/** 相性倍率の定数 */
const SE = 2.0; // 効果ばつぐん
const RE = 0.5; // 効果いまひとつ
const IM = 0;   // 効果なし
const NE = 1.0; // 等倍

/** 各タイプのUI表示用背景色（Tailwind CSSクラス） */
const TYPE_COLORS: Record<string, string> = {
  ノーマル: "bg-gray-400", ほのお: "bg-red-500", みず: "bg-blue-500", でんき: "bg-yellow-400",
  くさ: "bg-green-500", こおり: "bg-cyan-400", かくとう: "bg-orange-600", どく: "bg-purple-500",
  じめん: "bg-yellow-600", ひこう: "bg-indigo-400", エスパー: "bg-pink-500", むし: "bg-lime-500",
  いわ: "bg-amber-700", ゴースト: "bg-purple-700", ドラゴン: "bg-indigo-600", あく: "bg-gray-800",
  はがね: "bg-slate-500", フェアリー: "bg-pink-400",
};

/** 相性表：[攻撃わざタイプ][防御ポケモンタイプ] */
const CHART: Record<string, Record<string, number>> = {
  ノーマル: { ノーマル: NE, ほのお: NE, みず: NE, でんき: NE, くさ: NE, こおり: NE, かくとう: NE, どく: NE, じめん: NE, ひこう: NE, エスパー: NE, むし: NE, いわ: RE, ゴースト: IM, ドラゴン: NE, あく: NE, はがね: RE, フェアリー: NE },
  ほのお: { ノーマル: NE, ほのお: RE, みず: RE, でんき: NE, くさ: SE, こおり: SE, かくとう: NE, どく: NE, じめん: NE, ひこう: NE, エスパー: NE, むし: SE, いわ: RE, ゴースト: NE, ドラゴン: RE, あく: NE, はがね: SE, フェアリー: NE },
  みず: { ノーマル: NE, ほのお: SE, みず: RE, でんき: NE, くさ: RE, こおり: NE, かくとう: NE, どく: NE, じめん: SE, ひこう: NE, エスパー: NE, むし: NE, いわ: SE, ゴースト: NE, ドラゴン: RE, あく: NE, はがね: NE, フェアリー: NE },
  でんき: { ノーマル: NE, ほのお: NE, みず: SE, でんき: RE, くさ: RE, こおり: NE, かくとう: NE, どく: NE, じめん: IM, ひこう: SE, エスパー: NE, むし: NE, いわ: NE, ゴースト: NE, ドラゴン: RE, あく: NE, はがね: NE, フェアリー: NE },
  くさ: { ノーマル: NE, ほのお: RE, みず: SE, でんき: NE, くさ: RE, こおり: NE, かくとう: NE, どく: RE, じめん: SE, ひこう: RE, エスパー: NE, むし: RE, いわ: SE, ゴースト: NE, ドラゴン: RE, あく: NE, はがね: RE, フェアリー: NE },
  こおり: { ノーマル: NE, ほのお: RE, みず: RE, でんき: NE, くさ: SE, こおり: RE, かくとう: NE, どく: NE, じめん: SE, ひこう: SE, エスパー: NE, むし: NE, いわ: NE, ゴースト: NE, ドラゴン: SE, あく: NE, はがね: RE, フェアリー: NE },
  かくとう: { ノーマル: SE, ほのお: NE, みず: NE, でんき: NE, くさ: NE, こおり: SE, かくとう: NE, どく: RE, じめん: NE, ひこう: RE, エスパー: RE, むし: RE, いわ: SE, ゴースト: IM, ドラゴン: NE, あく: SE, はがね: SE, フェアリー: RE },
  どく: { ノーマル: NE, ほのお: NE, みず: NE, でんき: NE, くさ: SE, こおり: NE, かくとう: NE, どく: RE, じめん: RE, ひこう: NE, エスパー: NE, むし: NE, いわ: RE, ゴースト: RE, ドラゴン: NE, あく: NE, はがね: IM, フェアリー: SE },
  じめん: { ノーマル: NE, ほのお: SE, みず: NE, でんき: SE, くさ: RE, こおり: NE, かくとう: NE, どく: SE, じめん: NE, ひこう: IM, エスパー: NE, むし: RE, いわ: SE, ゴースト: NE, ドラゴン: NE, あく: NE, はがね: SE, フェアリー: NE },
  ひこう: { ノーマル: NE, ほのお: NE, みず: NE, でんき: RE, くさ: SE, こおり: NE, かくとう: SE, どく: NE, じめん: NE, ひこう: NE, エスパー: NE, むし: SE, いわ: RE, ゴースト: NE, ドラゴン: NE, あく: NE, はがね: RE, フェアリー: NE },
  エスパー: { ノーマル: NE, ほのお: NE, みず: NE, でんき: NE, くさ: NE, こおり: NE, かくとう: SE, どく: SE, じめん: NE, ひこう: NE, エスパー: RE, むし: NE, いわ: NE, ゴースト: NE, ドラゴン: NE, あく: IM, はがね: RE, フェアリー: NE },
  むし: { ノーマル: NE, ほのお: RE, みず: NE, でんき: NE, くさ: SE, こおり: NE, かくとう: RE, どく: RE, じめん: NE, ひこう: RE, エスパー: SE, むし: NE, いわ: NE, ゴースト: RE, ドラゴン: NE, あく: SE, はがね: RE, フェアリー: RE },
  いわ: { ノーマル: NE, ほのお: SE, みず: NE, でんき: NE, くさ: NE, こおり: SE, かくとう: RE, どく: NE, じめん: RE, ひこう: SE, エスパー: NE, むし: SE, いわ: NE, ゴースト: NE, ドラゴン: NE, あく: NE, はがね: RE, フェアリー: NE },
  ゴースト: { ノーマル: IM, ほのお: NE, みず: NE, でんき: NE, くさ: NE, こおり: NE, かくとう: NE, どく: NE, じめん: NE, ひこう: NE, エスパー: SE, むし: NE, いわ: NE, ゴースト: SE, ドラゴン: NE, あく: RE, はがね: NE, フェアリー: NE },
  ドラゴン: { ノーマル: NE, ほのお: NE, みず: NE, でんき: NE, くさ: NE, こおり: NE, かくとう: NE, どく: NE, じめん: NE, ひこう: NE, エスパー: NE, むし: NE, いわ: NE, ゴースト: NE, ドラゴン: SE, あく: NE, はがね: RE, フェアリー: IM },
  あく: { ノーマル: NE, ほのお: NE, みず: NE, でんき: NE, くさ: NE, こおり: NE, かくとう: RE, どく: NE, じめん: NE, ひこう: NE, エスパー: SE, むし: NE, いわ: NE, ゴースト: SE, ドラゴン: NE, あく: RE, はがね: NE, フェアリー: RE },
  はがね: { ノーマル: NE, ほのお: RE, みず: RE, でんき: RE, くさ: NE, こおり: SE, かくとう: NE, どく: NE, じめん: NE, ひこう: NE, エスパー: NE, むし: NE, いわ: SE, ゴースト: NE, ドラゴン: NE, あく: NE, はがね: RE, フェアリー: SE },
  フェアリー: { ノーマル: NE, ほのお: RE, みず: NE, でんき: NE, くさ: NE, こおり: NE, かくとう: SE, どく: RE, じめん: NE, ひこう: NE, エスパー: NE, むし: NE, いわ: NE, ゴースト: NE, ドラゴン: SE, あく: SE, はがね: RE, フェアリー: NE },
};

// --- 2. メインコンポーネント ---

/**
 * ポケモンタイプ相性計算機
 * 検索機能、手動タイプ選択、および結果表示のアコーディオンを含む
 */
export default function PokemonTypeCalculator() {
  // --- 状態管理 (State) ---
  const [selectedDefenseTypes, setSelectedDefenseTypes] = useState<string[]>(["ノーマル"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; types: string[] }[]>([]);

  // --- 選択中かどうかを保持するフラグ ---
  const isSelecting = useRef(false);

  /**
   * 検索窓の入力に基づくポケモン候補の取得
   * デバウンス処理によりAPIリクエスト回数を抑制
   */
  useEffect(() => {
    const fetchPokemon = async () => {
      if (searchTerm.trim().length < 1 || isSelecting.current) {
        // フラグが立っている場合は、検索を止めた後にフラグを戻す
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

  /**
   * 選択された防御タイプに基づき、全攻撃タイプとの相性を計算
   */
  const groupedResults = useMemo(() => {
    const results = TYPES.map((attackType) => {
      const multiplier = selectedDefenseTypes.reduce((acc, defType) => {
        const m = CHART[attackType]?.[defType] ?? NE;
        return acc * m;
      }, 1.0);

      // カテゴリ分類
      let category = "neutral";
      if (multiplier >= 4.0) category = "double-super-effective";
      else if (multiplier >= 2.0) category = "super-effective";
      else if (multiplier === 1.0) category = "neutral";
      else if (multiplier >= 0.5) category = "resistant";
      else if (multiplier >= 0.25) category = "double-resistant";
      else category = "triple-resistant-immune";

      return { type: attackType, multiplier, category };
    });

    return results.reduce((acc, curr) => {
      acc[curr.category] = [...(acc[curr.category] || []), curr];
      return acc;
    }, {} as Record<string, typeof results>);
  }, [selectedDefenseTypes]);

  // --- ハンドラー (Handlers) ---
  const handleSelectPokemon = (name: string, types: string[]) => {
    isSelecting.current = true; // 「今から選択します」というフラグを立てる
    setSelectedDefenseTypes(types);
    setSearchTerm(name);
    setSuggestions([]); // 確実にリストを空にする
  };

  /**
   * 防御タイプのトグル処理
   * 最大2つまで。1つの時は解除不可。
   */
  const toggleDefenseType = (type: string) => {
    setSelectedDefenseTypes((prev) => {
      if (prev.includes(type)) {
        return prev.length > 1 ? prev.filter((t) => t !== type) : prev;
      }
      return prev.length < 2 ? [...prev, type] : [prev[1], type];
    });
  };

  const categoryLabels: Record<string, string> = {
    "double-super-effective": "効果はちょうバツグンだ! (×4.0)",
    "super-effective": "効果はバツグンだ! (×2.0)",
    "neutral": "等倍 (×1.0)",
    "resistant": "効果はいまひとつだ (×0.5)", // 1/2を「いまひとつ」に
    "double-resistant": "効果はかなりいまひとつだ (×0.25)", // 1/4を「かなりいまひとつ」に
    "triple-resistant-immune": "効果がないようだ…",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 1. 検索セクション */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold mb-4">ポケモン名で検索</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                isSelecting.current = false; // 手入力されたらフラグを折る
                setSearchTerm(e.target.value);
              }}
              placeholder="例: ピカチュウ"
              className="w-full p-3 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {/* 検索候補リスト */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg overflow-hidden">
                {suggestions.map((p) => (
                  <button
                    key={p.name}
                    className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-600 border-b last:border-0 border-slate-100 dark:border-slate-600 transition-colors"
                    // onClick ではなく onMouseDown を使用
                    onMouseDown={(e) => {
                      e.preventDefault(); // input の onBlur による消失を防ぐ（もし今後追加する場合も安心）
                      handleSelectPokemon(p.name, p.types);
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

        {/* 2. 防御側タイプ選択セクション */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold mb-4">相手のタイプ</h2>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleDefenseType(type)}
                className={`px-4 py-2 rounded font-bold transition-all ${TYPE_COLORS[type]} ${type === "あく" ? "text-white" : "text-slate-900"
                  } ${selectedDefenseTypes.includes(type)
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

        {/* 3. 計算結果セクション */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <Accordion type="multiple" className="w-full">
            {Object.keys(categoryLabels).map((cat) => {
              const list = groupedResults[cat];
              if (!list || list.length === 0) return null;
              return (
                <AccordionItem key={cat} value={cat} className="border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">{categoryLabels[cat]} ({list.length})</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-4 gap-2 pt-2 pb-4">
                      {list.map((r) => (
                        <div
                          key={r.type}
                          className={`p-2 text-center rounded text-sm font-bold shadow-sm border border-black/5 ${TYPE_COLORS[r.type]
                            } ${r.type === "あく" ? "text-white" : "text-slate-900"}`}
                        >
                          {r.type}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        {/* 4. フッタークレジット */}
        <footer className="mt-12 py-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 pokemon-type-simulator | MIT License
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mx-auto">
            Data provided by{" "}
            <a
              href="https://pokeapi.co/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-blue-500"
            >
              PokeAPI
            </a>
            . Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME
            FREAK inc. This is an unofficial fan tool.
          </p>
        </footer>
      </div>
    </div>
  );
}