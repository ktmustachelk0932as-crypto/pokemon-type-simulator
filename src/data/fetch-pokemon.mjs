/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

// fetch-pokemon.mjs
import fs from 'fs';

const TYPE_MAP = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき",
  grass: "くさ", ice: "こおり", fighting: "かくとう", poison: "どく",
  ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
  rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", dark: "あく",
  steel: "はがね", fairy: "フェアリー"
};

// タイプが変化する代替フォルム（リージョンフォーム・ロトムの家電フォルム等）の判定に使う
// 「種族名を除いた接尾辞」→表示名の対応表。
// label: `${ベース日本語名}(${label})` の形で表示名を組み立てる（例: ロコン(アローラのすがた)）
// fullName: 種族名と結合せずそのまま表示名として使う（例: ヒートロトム）
const ALT_FORM_MAP = {
  // リージョンフォーム
  alola: { label: "アローラのすがた" },
  galar: { label: "ガラルのすがた" },
  hisui: { label: "ヒスイのすがた" },
  paldea: { label: "パルデアのすがた" },
  // パルデアケンタロスの3品種（いずれも接尾辞が "-paldea" 単体ではなく
  // "-paldea-xxx-breed" になるため個別に登録する）
  "paldea-combat-breed": { label: "パルデアのすがた・コンバット種" },
  "paldea-blaze-breed": { label: "パルデアのすがた・ブレイズ種" },
  "paldea-aqua-breed": { label: "パルデアのすがた・ウォーター種" },
  // ロトムの家電フォルム
  heat: { fullName: "ヒートロトム" },
  wash: { fullName: "ウォッシュロトム" },
  frost: { fullName: "フロストロトム" },
  fan: { fullName: "スピンロトム" },
  mow: { fullName: "カットロトム" },
};

// 待機時間を実装するヘルパー関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PokeAPIから最新のポケモン総数を取得
 * @returns {Promise<number>} ポケモンの総数
 */
async function getTotalPokemonCount() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1');
    const data = await response.json();
    return data.count || 1025; // フォールバック値
  } catch (e) {
    console.warn('総数の取得に失敗しました。デフォルト値1025を使用します。', e.message);
    return 1025; // フォールバック値
  }
}

/**
 * 既存のポケモンデータを読み込む
 * @returns {Array} 既存のポケモンデータ配列
 */
function loadExistingData() {
  const filePath = './src/data/pokemon.json';
  if (fs.existsSync(filePath)) {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('既存データの読み込みに失敗しました。新規取得を開始します。', e.message);
      return [];
    }
  }
  return [];
}

/**
 * 既存のリージョンフォームデータを読み込む
 * @returns {Array} 既存のリージョンフォームデータ配列
 */
function loadExistingVariants() {
  const filePath = './src/data/pokemon-regional-forms.json';
  if (fs.existsSync(filePath)) {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('既存のリージョンフォームデータの読み込みに失敗しました。新規取得を開始します。', e.message);
      return [];
    }
  }
  return [];
}

/**
 * pokemon-speciesのvarietiesからタイプが異なる代替フォルム（リージョンフォーム・
 * ロトムの家電フォルム等、ALT_FORM_MAPに登録されているもの）を抽出する
 * @param {object} species pokemon-speciesのレスポンス
 * @param {string[]} baseTypes デフォルトの姿のタイプ（日本語）
 * @param {string} baseJpName デフォルトの姿の日本語名
 * @returns {Promise<Array>} 代替フォルムのエントリ配列
 */
async function extractRegionalVariants(species, baseTypes, baseJpName) {
  const results = [];
  const prefix = `${species.name}-`;

  for (const variety of species.varieties || []) {
    if (variety.is_default) continue;
    if (!variety.pokemon.name.startsWith(prefix)) continue;

    const formKey = variety.pokemon.name.slice(prefix.length);
    const formInfo = ALT_FORM_MAP[formKey];
    if (!formInfo) continue;

    try {
      const resVariant = await fetch(variety.pokemon.url);
      const variantPokemon = await resVariant.json();
      await sleep(100);

      const types = variantPokemon.types.map((t) => TYPE_MAP[t.type.name] || t.type.name);
      const isSameTypes =
        types.length === baseTypes.length && types.every((t, idx) => t === baseTypes[idx]);
      if (isSameTypes) continue;

      results.push({
        name: formInfo.fullName || `${baseJpName}(${formInfo.label})`,
        types,
        baseId: species.id,
        formKey,
      });
    } catch (e) {
      console.error(`代替フォルムの取得に失敗しました: ${variety.pokemon.name}`, e.message);
    }
  }

  return results;
}

async function fetchPokemonData() {
  console.log("ポケモンの総数を取得中...");
  const TOTAL_POKEMON = await getTotalPokemonCount();

  // 既存のデータを読み込む
  const existingData = loadExistingData();
  const existingCount = existingData.length;

  // 既存のリージョンフォームデータを読み込む
  const variantsFilePath = './src/data/pokemon-regional-forms.json';
  const isFirstVariantRun = !fs.existsSync(variantsFilePath);
  const existingVariants = loadExistingVariants();
  const knownVariantKeys = new Set(existingVariants.map((v) => `${v.baseId}-${v.formKey}`));
  const newVariants = [];

  console.log(`既存データ: ${existingCount} 匹`);
  console.log(`最新総数: ${TOTAL_POKEMON} 匹`);

  const newPokemonList = [];

  if (existingCount >= TOTAL_POKEMON) {
    console.log('既存データが最新です。追加取得は不要です。');
  } else {
    const newCount = TOTAL_POKEMON - existingCount;
    console.log(`差分: ${newCount} 匹の新しいポケモンデータを取得します。`);
    console.log("データ取得中... (数分かかる場合があります)");
    await sleep(100); // API呼び出し後の待機

    const startId = existingCount + 1;

    for (let i = startId; i <= TOTAL_POKEMON; i++) {
      try {
        // 1. タイプと英語名を取得
        const resData = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const pokemon = await resData.json();
        await sleep(100); // 0.1秒待機

        // 2. 日本語名を取得
        const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}`);
        const species = await resSpecies.json();
        await sleep(100); // 0.1秒待機

        const jpName = species.names.find(name => name.language.name === "ja-Hrkt")?.name
                    || species.names.find(name => name.language.name === "ja")?.name;

        if (jpName) {
          const types = pokemon.types.map(t => TYPE_MAP[t.type.name] || t.type.name);
          newPokemonList.push({ name: jpName, types });

          // 3. リージョンフォーム（姿違い）を抽出
          const variants = await extractRegionalVariants(species, types, jpName);
          for (const variant of variants) {
            const key = `${variant.baseId}-${variant.formKey}`;
            if (!knownVariantKeys.has(key)) {
              knownVariantKeys.add(key);
              newVariants.push(variant);
            }
          }

          const progress = i - startId + 1;
          if (progress % 50 === 0) console.log(`${progress} 匹取得完了... (ID: ${i})`);
        }
      } catch (e) {
        console.error(`ID: ${i} の取得に失敗しました`, e.message);
      }
    }
  }

  // 既存データと新しいデータをマージ
  const mergedData = [...existingData, ...newPokemonList];

  // リージョンフォームの初回バックフィル（pokemon-regional-forms.jsonが存在しない場合のみ、
  // 既に取得済みの範囲を再スキャンする一度きりの処理）
  if (isFirstVariantRun && existingCount > 0) {
    console.log(`リージョンフォームの初回バックフィルを実行します... (${existingCount} 匹分)`);
    for (let id = 1; id <= existingCount; id++) {
      const baseEntry = existingData[id - 1];
      if (!baseEntry) continue;

      try {
        const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        const species = await resSpecies.json();
        await sleep(100);

        const variants = await extractRegionalVariants(species, baseEntry.types, baseEntry.name);
        for (const variant of variants) {
          const key = `${variant.baseId}-${variant.formKey}`;
          if (!knownVariantKeys.has(key)) {
            knownVariantKeys.add(key);
            newVariants.push(variant);
          }
        }

        if (id % 50 === 0) console.log(`リージョンフォームのバックフィル: ${id} / ${existingCount} 匹確認済み...`);
      } catch (e) {
        console.error(`ID: ${id} のリージョンフォーム確認に失敗しました`, e.message);
      }
    }
  }

  // src/data フォルダがない場合は作成
  if (!fs.existsSync('./src/data')) {
    fs.mkdirSync('./src/data', { recursive: true });
  }

  if (newPokemonList.length > 0) {
    fs.writeFileSync('./src/data/pokemon.json', JSON.stringify(mergedData, null, 2));
  }

  if (newVariants.length > 0) {
    const mergedVariants = [...existingVariants, ...newVariants];
    fs.writeFileSync(variantsFilePath, JSON.stringify(mergedVariants, null, 2));
  }

  console.log(`完了！ 新規取得: ${newPokemonList.length} 匹、合計: ${mergedData.length} 匹のデータを保存しました。`);
  console.log(`リージョンフォーム新規取得: ${newVariants.length} 件、合計: ${existingVariants.length + newVariants.length} 件。`);
}

fetchPokemonData();