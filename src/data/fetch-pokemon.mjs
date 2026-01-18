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

async function fetchPokemonData() {
  console.log("ポケモンの総数を取得中...");
  const TOTAL_POKEMON = await getTotalPokemonCount();
  
  // 既存のデータを読み込む
  const existingData = loadExistingData();
  const existingCount = existingData.length;
  
  console.log(`既存データ: ${existingCount} 匹`);
  console.log(`最新総数: ${TOTAL_POKEMON} 匹`);
  
  if (existingCount >= TOTAL_POKEMON) {
    console.log('既存データが最新です。追加取得は不要です。');
    return;
  }
  
  const newCount = TOTAL_POKEMON - existingCount;
  console.log(`差分: ${newCount} 匹の新しいポケモンデータを取得します。`);
  console.log("データ取得中... (数分かかる場合があります)");
  await sleep(100); // API呼び出し後の待機
  
  const newPokemonList = [];
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
        newPokemonList.push({
          name: jpName,
          types: pokemon.types.map(t => TYPE_MAP[t.type.name] || t.type.name)
        });
        const progress = i - startId + 1;
        if (progress % 50 === 0) console.log(`${progress} 匹取得完了... (ID: ${i})`);
      }
    } catch (e) {
      console.error(`ID: ${i} の取得に失敗しました`, e.message);
    }
  }

  // 既存データと新しいデータをマージ
  const mergedData = [...existingData, ...newPokemonList];

  // src/data フォルダがない場合は作成
  if (!fs.existsSync('./src/data')) {
    fs.mkdirSync('./src/data', { recursive: true });
  }

  fs.writeFileSync('./src/data/pokemon.json', JSON.stringify(mergedData, null, 2));
  console.log(`完了！ 新規取得: ${newPokemonList.length} 匹、合計: ${mergedData.length} 匹のデータを保存しました。`);
}

fetchPokemonData();