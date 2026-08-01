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
  // デオキシスのフォルム（ノーマルフォルムはデフォルトの姿として pokemon.json 側が担う）
  attack: { label: "アタックフォルム" },
  defense: { label: "ディフェンスフォルム" },
  speed: { label: "スピードフォルム" },
  // 霊獣フォルム（トルネロス・ボルトロス・ランドロス・ラブトロス）
  therian: { label: "れいじゅうフォルム" },
  // 性別で種族値・特性が異なる種のメス（イエッサン・イダイトウ・パフュートン・ニャオニクス）。
  // オスはデフォルトの姿として pokemon.json 側が担う
  female: { label: "メスのすがた" },
};

// ALT_FORM_MAPの内容を変えたらこの値を+1する。既取得の全種族に対する
// 代替フォルムの再スキャンが一度だけ走る（variant-scan-meta.jsonと比較）
const FORM_SCAN_VERSION = 2;
const VARIANT_SCAN_META_PATH = './src/data/variant-scan-meta.json';

// PokeAPIのstat名 → pokemon.jsonのstatsキーの対応表
const STAT_MAP = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "spAttack",
  "special-defense": "spDefense",
  speed: "speed",
};

// 待機時間を実装するヘルパー関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 特性の英語スラッグ→日本語名のキャッシュ。/ability/{slug} の再取得を避けるため
// ability-names.json に永続化する
const ABILITY_NAMES_PATH = './src/data/ability-names.json';
// 特性の日本語名→解説文（フレーバーテキスト）のキャッシュ。ability-descriptions.json に永続化する
const ABILITY_DESCRIPTIONS_PATH = './src/data/ability-descriptions.json';
let abilityNameMap = {};
let abilityDescriptionMap = {};
let abilityCacheDirty = false;
let abilityDescCacheDirty = false;

function loadJsonMapCache(path, label) {
  if (fs.existsSync(path)) {
    try {
      const data = JSON.parse(fs.readFileSync(path, 'utf8'));
      if (data && typeof data === 'object' && !Array.isArray(data)) return data;
    } catch (e) {
      console.warn(`${label}キャッシュの読み込みに失敗しました。再取得します。`, e.message);
    }
  }
  return {};
}

/**
 * /ability/{slug} レスポンスから日本語の解説文を抽出する。
 * 漢字表記（ja）を優先し、なければかな表記（ja-Hrkt）を使う。
 * 同一言語で複数バージョンの記載がある場合は最新（配列末尾）を採用する
 * @param {object} data /ability/{slug} のレスポンス
 * @returns {string} 解説文（改行・全角スペース除去済み。見つからなければ空文字）
 */
function extractAbilityJpDescription(data) {
  const entries = data.flavor_text_entries || [];
  const pick = (lang) => entries.filter((e) => e.language.name === lang).at(-1);
  const entry = pick('ja') || pick('ja-Hrkt');
  return entry ? entry.flavor_text.replace(/[\n　]/g, '') : '';
}

/**
 * 特性の日本語名を取得する（キャッシュ優先、なければ /ability/{slug} を取得）。
 * API取得時は解説文もあわせてキャッシュする
 * @param {string} slug 特性の英語スラッグ（例: "levitate"）
 * @returns {Promise<string>} 日本語名（取得失敗時はスラッグをそのまま返す）
 */
async function getAbilityJpName(slug) {
  if (abilityNameMap[slug]) return abilityNameMap[slug];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/ability/${slug}`);
    const data = await res.json();
    await sleep(100);
    const jpName = data.names?.find((n) => n.language.name === 'ja-Hrkt')?.name
                || data.names?.find((n) => n.language.name === 'ja')?.name
                || slug;
    abilityNameMap[slug] = jpName;
    abilityCacheDirty = true;
    const description = extractAbilityJpDescription(data);
    if (description && !abilityDescriptionMap[jpName]) {
      abilityDescriptionMap[jpName] = description;
      abilityDescCacheDirty = true;
    }
    return jpName;
  } catch (e) {
    console.error(`特性名の取得に失敗しました: ${slug}`, e.message);
    return slug;
  }
}

/**
 * 名前キャッシュ済みだが解説文が未取得の特性について /ability/{slug} を引き直し、
 * 解説文キャッシュを補完する（一度きりのバックフィル）
 */
async function backfillAbilityDescriptions() {
  const missingSlugs = Object.keys(abilityNameMap).filter(
    (slug) => !abilityDescriptionMap[abilityNameMap[slug]]
  );
  if (missingSlugs.length === 0) return;

  console.log(`特性の解説文バックフィルを実行します... (${missingSlugs.length} 件分)`);
  let done = 0;
  for (const slug of missingSlugs) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/ability/${slug}`);
      const data = await res.json();
      await sleep(100);
      const description = extractAbilityJpDescription(data);
      if (description) {
        abilityDescriptionMap[abilityNameMap[slug]] = description;
        abilityDescCacheDirty = true;
      }
      done++;
      if (done % 50 === 0) console.log(`特性の解説文バックフィル: ${done} / ${missingSlugs.length} 件完了...`);
    } catch (e) {
      console.error(`特性の解説文の取得に失敗しました: ${slug}`, e.message);
    }
  }
}

/**
 * /pokemon/{id} レスポンスから特性（日本語名）と種族値を抽出する
 * @param {object} pokemon /pokemon/{id} のレスポンス
 * @returns {Promise<{abilities: Array<{name: string, hidden: boolean}>, stats: object}>}
 */
async function extractAbilitiesAndStats(pokemon) {
  const abilities = [];
  for (const entry of pokemon.abilities || []) {
    const name = await getAbilityJpName(entry.ability.name);
    // 通常特性と隠れ特性が同名の場合（例: 脱皮持ちの一部）は通常側のみ残す
    if (abilities.some((a) => a.name === name)) continue;
    abilities.push({ name, hidden: entry.is_hidden });
  }

  const stats = {};
  for (const entry of pokemon.stats || []) {
    const key = STAT_MAP[entry.stat.name];
    if (key) stats[key] = entry.base_stat;
  }

  return { abilities, stats };
}

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
 * pokemon-speciesのvarietiesから代替フォルム（リージョンフォーム・ロトムの家電フォルム・
 * デオキシス・霊獣フォルム・性別違い等、ALT_FORM_MAPに登録されているもの）を抽出する。
 * タイプがベースと同じでも種族値・特性が異なるフォルム（霊獣・デオキシス等）があるため、
 * ALT_FORM_MAPに登録されていれば無条件で採用する
 * @param {object} species pokemon-speciesのレスポンス
 * @param {string} baseJpName デフォルトの姿の日本語名
 * @returns {Promise<Array>} 代替フォルムのエントリ配列
 */
async function extractRegionalVariants(species, baseJpName) {
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
      const { abilities, stats } = await extractAbilitiesAndStats(variantPokemon);

      results.push({
        name: formInfo.fullName || `${baseJpName}(${formInfo.label})`,
        types,
        abilities,
        stats,
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
  abilityNameMap = loadJsonMapCache(ABILITY_NAMES_PATH, '特性名');
  abilityDescriptionMap = loadJsonMapCache(ABILITY_DESCRIPTIONS_PATH, '特性解説文');
  const TOTAL_POKEMON = await getTotalPokemonCount();

  // 既存のデータを読み込む
  const existingData = loadExistingData();
  const existingCount = existingData.length;

  // 既存のリージョンフォームデータを読み込む
  const variantsFilePath = './src/data/pokemon-regional-forms.json';
  const scanMeta = loadJsonMapCache(VARIANT_SCAN_META_PATH, 'フォルムスキャン情報');
  const storedFormScanVersion = Number(scanMeta.formScanVersion) || 0;
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
          const { abilities, stats } = await extractAbilitiesAndStats(pokemon);
          newPokemonList.push({ name: jpName, types, abilities, stats });

          // 3. 代替フォルム（姿違い）を抽出
          const variants = await extractRegionalVariants(species, jpName);
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

  // 代替フォルムの再スキャン（初回実行時、またはALT_FORM_MAP更新でFORM_SCAN_VERSIONが
  // 上がった場合に、既に取得済みの全種族を一度だけ再スキャンする。
  // knownVariantKeysで重複排除されるため冪等）
  if (storedFormScanVersion < FORM_SCAN_VERSION) {
    if (existingCount > 0) {
      console.log(`フォルム定義の更新を検出しました。代替フォルムを再スキャンします... (${existingCount} 匹分)`);
      for (let id = 1; id <= existingCount; id++) {
        const baseEntry = existingData[id - 1];
        if (!baseEntry) continue;

        try {
          const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
          const species = await resSpecies.json();
          await sleep(100);

          const variants = await extractRegionalVariants(species, baseEntry.name);
          for (const variant of variants) {
            const key = `${variant.baseId}-${variant.formKey}`;
            if (!knownVariantKeys.has(key)) {
              knownVariantKeys.add(key);
              newVariants.push(variant);
            }
          }

          if (id % 50 === 0) console.log(`代替フォルムの再スキャン: ${id} / ${existingCount} 匹確認済み...`);
        } catch (e) {
          console.error(`ID: ${id} の代替フォルム確認に失敗しました`, e.message);
        }
      }
    }
    fs.writeFileSync(VARIANT_SCAN_META_PATH, JSON.stringify({ formScanVersion: FORM_SCAN_VERSION }, null, 2));
  }

  // 特性・種族値のバックフィル（abilities / stats フィールドを持たない既存エントリのみ
  // /pokemon/{id} を再取得して補完する。連番不変条件には影響しない）
  let detailBackfillCount = 0;
  const needsDetailBackfill = existingData.filter((p) => !p.abilities || !p.stats).length;
  if (needsDetailBackfill > 0) {
    console.log(`特性・種族値のバックフィルを実行します... (${needsDetailBackfill} 匹分)`);
    for (let id = 1; id <= existingData.length; id++) {
      const entry = existingData[id - 1];
      if (!entry || (entry.abilities && entry.stats)) continue;

      try {
        const resData = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = await resData.json();
        await sleep(100);

        const { abilities, stats } = await extractAbilitiesAndStats(pokemon);
        entry.abilities = abilities;
        entry.stats = stats;
        detailBackfillCount++;

        if (detailBackfillCount % 50 === 0) {
          console.log(`特性・種族値のバックフィル: ${detailBackfillCount} / ${needsDetailBackfill} 匹完了...`);
        }
      } catch (e) {
        console.error(`ID: ${id} の特性・種族値の取得に失敗しました`, e.message);
      }
    }
  }

  // リージョンフォームの特性・種族値バックフィル（baseId経由でspeciesを引き直し、
  // formKeyに一致するフォルムの詳細を再取得する）
  let variantDetailBackfillCount = 0;
  const variantsNeedingDetail = existingVariants.filter((v) => !v.abilities || !v.stats);
  if (variantsNeedingDetail.length > 0) {
    console.log(`リージョンフォームの特性・種族値バックフィルを実行します... (${variantsNeedingDetail.length} 件分)`);
    const speciesCache = new Map();

    for (const variant of variantsNeedingDetail) {
      try {
        let species = speciesCache.get(variant.baseId);
        if (!species) {
          const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${variant.baseId}`);
          species = await resSpecies.json();
          await sleep(100);
          speciesCache.set(variant.baseId, species);
        }

        const variety = (species.varieties || []).find(
          (v) => v.pokemon.name === `${species.name}-${variant.formKey}`
        );
        if (!variety) {
          console.warn(`フォルムが見つかりませんでした: ${variant.name} (${variant.baseId}-${variant.formKey})`);
          continue;
        }

        const resVariant = await fetch(variety.pokemon.url);
        const variantPokemon = await resVariant.json();
        await sleep(100);

        const { abilities, stats } = await extractAbilitiesAndStats(variantPokemon);
        variant.abilities = abilities;
        variant.stats = stats;
        variantDetailBackfillCount++;
      } catch (e) {
        console.error(`リージョンフォームの特性・種族値の取得に失敗しました: ${variant.name}`, e.message);
      }
    }
  }

  // 特性の解説文バックフィル（名前キャッシュ済みで解説文が未取得の特性のみ）
  await backfillAbilityDescriptions();

  // src/data フォルダがない場合は作成
  if (!fs.existsSync('./src/data')) {
    fs.mkdirSync('./src/data', { recursive: true });
  }

  if (newPokemonList.length > 0 || detailBackfillCount > 0) {
    fs.writeFileSync('./src/data/pokemon.json', JSON.stringify(mergedData, null, 2));
  }

  if (newVariants.length > 0 || variantDetailBackfillCount > 0) {
    const mergedVariants = [...existingVariants, ...newVariants];
    fs.writeFileSync(variantsFilePath, JSON.stringify(mergedVariants, null, 2));
  }

  if (abilityCacheDirty) {
    fs.writeFileSync(ABILITY_NAMES_PATH, JSON.stringify(abilityNameMap, null, 2));
  }

  if (abilityDescCacheDirty) {
    fs.writeFileSync(ABILITY_DESCRIPTIONS_PATH, JSON.stringify(abilityDescriptionMap, null, 2));
  }

  console.log(`完了！ 新規取得: ${newPokemonList.length} 匹、合計: ${mergedData.length} 匹のデータを保存しました。`);
  console.log(`リージョンフォーム新規取得: ${newVariants.length} 件、合計: ${existingVariants.length + newVariants.length} 件。`);
  console.log(`特性・種族値バックフィル: 通常 ${detailBackfillCount} 匹、リージョンフォーム ${variantDetailBackfillCount} 件。特性名キャッシュ: ${Object.keys(abilityNameMap).length} 件、解説文キャッシュ: ${Object.keys(abilityDescriptionMap).length} 件。`);
}

fetchPokemonData();