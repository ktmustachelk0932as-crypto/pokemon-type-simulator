# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, etc.) when working with code in this repository.

## Project Overview

ポケモンのタイプ相性を計算する、日本語UIのNext.js（App Router）アプリ。ユーザーは防御側のタイプを最大2つ選択（またはポケモン名を検索してタイプを自動入力）でき、全18タイプの攻撃側わざがどれだけ効果的かを効果倍率カテゴリ（×4、×2、×1、×0.5、×0.25、無効）ごとにグループ表示する。

## Directory Structure

| ディレクトリ | 役割 |
|-------------|------|
| `app/` | Next.js App Router本体。`page.tsx`は`lib/type-chart.ts`・`hooks/use-pokemon-search.ts`・`components/`のUIパーツを組み合わせる構成コンポーネント、`api/pokemon/route.ts`が唯一有効なポケモン検索API |
| `src/data/` | `fetch-pokemon.mjs`（PokeAPI取得スクリプト）と、その出力である`pokemon.json`・`pokemon-regional-forms.json`（いずれもコミット対象） |
| `components/ui/` | shadcn/ui（style: new-york, baseColor: neutral）で生成されたUIプリミティブ |
| `components/` | `pokemon-search-box.tsx`・`type-selector.tsx`・`effectiveness-results.tsx`など、トップページを構成する手書きのUIコンポーネント |
| `hooks/` | `use-pokemon-search.ts`（ポケモン名検索のデバウンス・状態管理）などのカスタムフック |
| `lib/` | `type-chart.ts`（タイプ相性表・相性計算ロジック）、`utils.ts`（`cn`などの汎用ユーティリティ） |
| `public/` | アイコン・プレースホルダー画像などの静的アセット |

## Commands

```bash
npm run dev            # 開発サーバー起動 http://localhost:3000
npm run build           # 本番用ビルド
npm run start           # 本番ビルドの実行
npm run lint            # eslint .
npm run fetch-pokemon   # PokeAPIからsrc/data/pokemon.jsonを更新
```

このリポジトリにはテストスイートは設定されていない。

`fetch-pokemon`（`src/data/fetch-pokemon.mjs`）はNext.jsのビルドには含まれない独立したNode.jsスクリプト。PokeAPIから現在のポケモン総数を取得し、既存の`pokemon.json`配列の長さと比較して`既存件数 + 1`以降のIDのみを取得する（既存データがID順に連続した先頭部分であることが前提で、欠番の補完は行わない）。1匹あたり2回のPokeAPI呼び出し（species + types）ごとに100msスリープするため、フル取得には数分かかる。

アローラ・ガラル・ヒスイ・パルデアのリージョンフォームやロトムの家電フォルムなど、同じ図鑑番号でもタイプが異なる代替フォルム（`fetch-pokemon.mjs`内の`ALT_FORM_MAP`に登録されているもののみ）は`pokemon.json`とは別に`pokemon-regional-forms.json`へ保存する。`pokemon.json`側の差分取得ロジック・前提（配列長=次に取得すべき図鑑番号）には一切影響しない。`pokemon-regional-forms.json`が存在しない場合のみ、既存の全種族に対して一度きりのバックフィル（`pokemon-species`の再取得）が走る。2回目以降は新規追加分の種族のみ確認する。対象フォルムを追加する場合は`ALT_FORM_MAP`にキー（種族の英語名を除いた接尾辞、例: `heat`や`paldea-combat-breed`）を追記する。

## Code Style

- 言語: TypeScript / React 19 / Next.js App Router
- UIコンポーネント: `components/ui/`はshadcn CLIで生成・管理されたものとして扱い、手書きせず既存セットとの一貫性を保つ
- パスエイリアス: `@/*`はリポジトリルートにマッピング（`tsconfig.json`）。`components.json`のshadcn aliases（`@/components`、`@/lib`、`@/hooks`、`@/components/ui`）と整合させる
- タイプ相性表（`CHART`）や18タイプリスト、Tailwindカラーマップは`lib/type-chart.ts`にハードコードされた定数であり、PokeAPI由来ではない。相性ルールを変更する場合はこのオブジェクトを直接編集する
- 複数タイプの効果倍率は各防御側タイプに対する倍率の積（例: ほのお×みず/くさ = 0.5 × 2.0 = 1.0）。`lib/type-chart.ts`の`getMultiplier`/`groupResultsByCategory`で計算

## Boundaries

- `next.config.mjs`の`typescript.ignoreBuildErrors: true`は`npm run build`を型エラーで失敗させない設定。外す場合は既存の型エラーが顕在化するため事前に確認を求める
- `.env*`ファイルを変更・コミットしない
- 重要な設計判断（タイプ相性ロジックの変更、UIライブラリの入れ替えなど）を独断で進めない。必ず確認を求める

## Workflow

- 型エラーの検出には`npm run build`ではなく`tsc`やエディタの診断、または`npm run lint`を使う
- タイプ相性ロジックを変更した際は、複数タイプの組み合わせ（例: ほのお×くさ→みず）で手動確認する
- `pokemon.json`を再取得する際は差分取得の前提（既存データが連続したID範囲であること）を崩さないよう注意する
