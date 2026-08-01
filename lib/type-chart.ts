/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

export const TYPES = [
  "ノーマル", "ほのお", "みず", "でんき", "くさ", "こおり", "かくとう", "どく", "じめん",
  "ひこう", "エスパー", "むし", "いわ", "ゴースト", "ドラゴン", "あく", "はがね", "フェアリー",
] as const;

const SE = 2.0;
const RE = 0.5;
const IM = 0;
const NE = 1.0;

export const TYPE_COLORS: Record<string, string> = {
  ノーマル: "bg-gray-400", ほのお: "bg-red-500", みず: "bg-blue-500", でんき: "bg-yellow-400",
  くさ: "bg-green-500", こおり: "bg-cyan-400", かくとう: "bg-orange-600", どく: "bg-purple-500",
  じめん: "bg-yellow-600", ひこう: "bg-indigo-400", エスパー: "bg-pink-500", むし: "bg-lime-500",
  いわ: "bg-amber-700", ゴースト: "bg-purple-700", ドラゴン: "bg-indigo-600", あく: "bg-gray-800",
  はがね: "bg-slate-500", フェアリー: "bg-pink-400",
};

export const CHART: Record<string, Record<string, number>> = {
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

export const categoryLabels: Record<string, string> = {
  "double-super-effective": "効果はちょうバツグンだ! (×4.0)",
  "super-effective": "効果はバツグンだ! (×2.0)",
  "neutral": "等倍 (×1.0)",
  "resistant": "効果はいまひとつだ (×0.5)",
  "double-resistant": "効果はかなりいまひとつだ (×0.25)",
  "triple-resistant-immune": "効果がないようだ…",
};

// カテゴリごとの基準倍率。特性補正でこの値からずれた場合のみチップに実倍率を表示する
export const categoryBaseMultipliers: Record<string, number> = {
  "double-super-effective": 4.0,
  "super-effective": 2.0,
  "neutral": 1.0,
  "resistant": 0.5,
  "double-resistant": 0.25,
  "triple-resistant-immune": 0,
};

// タイプ相性に影響する防御側特性の補正表。
// immuneTo: 該当攻撃タイプを無効化（倍率0）
// resist: 該当攻撃タイプの倍率に乗算する係数
// superEffectiveScale: 合計倍率が2.0以上（バツグン）のときに乗算する係数
// わざ単位で判定される特性（ぼうだん・ぼうじん等）はタイプ相性では表現できないため対象外
type AbilityEffect = {
  immuneTo?: string[];
  resist?: Record<string, number>;
  superEffectiveScale?: number;
};

export const ABILITY_EFFECTS: Record<string, AbilityEffect> = {
  ふゆう: { immuneTo: ["じめん"] },
  もらいび: { immuneTo: ["ほのお"] },
  ちょすい: { immuneTo: ["みず"] },
  よびみず: { immuneTo: ["みず"] },
  ちくでん: { immuneTo: ["でんき"] },
  でんきエンジン: { immuneTo: ["でんき"] },
  ひらいしん: { immuneTo: ["でんき"] },
  そうしょく: { immuneTo: ["くさ"] },
  あついしぼう: { resist: { ほのお: 0.5, こおり: 0.5 } },
  たいねつ: { resist: { ほのお: 0.5 } },
  きよめのしお: { resist: { ゴースト: 0.5 } },
  フィルター: { superEffectiveScale: 0.75 },
  ハードロック: { superEffectiveScale: 0.75 },
  プリズムアーマー: { superEffectiveScale: 0.75 },
};

/** タイプ相性に影響する特性かどうか */
export function abilityAffectsMatchup(ability: string): boolean {
  return ability in ABILITY_EFFECTS;
}

export type EffectivenessResult = {
  type: string;
  multiplier: number;
  category: string;
};

/** 複数の防御側タイプに対する攻撃側タイプの合計倍率（各倍率の積、特性補正込み） */
export function getMultiplier(defenseTypes: string[], attackType: string, ability?: string | null): number {
  let multiplier = defenseTypes.reduce((acc, defType) => acc * (CHART[attackType]?.[defType] ?? NE), 1.0);

  const effect = ability ? ABILITY_EFFECTS[ability] : undefined;
  if (!effect) return multiplier;

  if (effect.immuneTo?.includes(attackType)) return 0;
  if (effect.resist?.[attackType] !== undefined) multiplier *= effect.resist[attackType];
  if (effect.superEffectiveScale !== undefined && multiplier >= SE) multiplier *= effect.superEffectiveScale;

  return multiplier;
}

// 特性補正により2の冪以外の倍率（×1.5、×3、×0.75等）が生じるため、境界一致ではなく範囲で判定する
export function getEffectivenessCategory(multiplier: number): string {
  if (multiplier >= 4.0) return "double-super-effective";
  if (multiplier > 1.0) return "super-effective";
  if (multiplier === 1.0) return "neutral";
  if (multiplier >= 0.5) return "resistant";
  if (multiplier > 0) return "double-resistant";
  return "triple-resistant-immune";
}

/** 全18タイプの攻撃側わざの効果倍率を計算し、カテゴリごとにグループ化する */
export function groupResultsByCategory(
  defenseTypes: string[],
  ability?: string | null
): Record<string, EffectivenessResult[]> {
  const results = TYPES.map((attackType) => {
    const multiplier = getMultiplier(defenseTypes, attackType, ability);
    return { type: attackType, multiplier, category: getEffectivenessCategory(multiplier) };
  });

  return results.reduce((acc, curr) => {
    acc[curr.category] = [...(acc[curr.category] || []), curr];
    return acc;
  }, {} as Record<string, EffectivenessResult[]>);
}

/** 弱点（バツグン以上）が存在する場合に自動展開すべきアコーディオンのカテゴリ一覧を返す */
export function getWeaknessCategories(defenseTypes: string[], ability?: string | null): string[] {
  const targets = ["double-super-effective", "super-effective"];
  const hasWeakness = TYPES.some((attackType) => getMultiplier(defenseTypes, attackType, ability) > 1.0);
  return hasWeakness ? targets : [];
}
