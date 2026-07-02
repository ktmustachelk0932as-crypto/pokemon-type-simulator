# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, etc.) when working with code in this repository.

## Project Overview

ポケモンのタイプ相性を計算する、日本語UIのNext.js（App Router）アプリ。ユーザーは防御側のタイプを最大2つ選択（またはポケモン名を検索してタイプを自動入力）でき、全18タイプの攻撃側わざがどれだけ効果的かを効果倍率カテゴリ（×4、×2、×1、×0.5、×0.25、無効）ごとにグループ表示する。

## Directory Structure

| ディレクトリ | 役割 |
|-------------|------|
| `app/` | Next.js App Router本体。`page.tsx`にUI・状態管理・タイプ相性ロジックが集約、`api/pokemon/route.ts`が唯一有効なポケモン検索API |
| `src/data/` | `fetch-pokemon.mjs`（PokeAPI取得スクリプト）と、その出力である`pokemon.json`（コミット対象） |
| `src/app/` | **旧APIルートの残骸。App Routerからは解決されないデッドコード。** 編集しても反映されない |
| `components/ui/` | shadcn/ui（style: new-york, baseColor: neutral）で生成されたUIプリミティブ |
| `components/` | `theme-provider.tsx`など手書きの共有コンポーネント |
| `hooks/` | `use-mobile.ts`、`use-toast.ts` などのカスタムフック |
| `lib/` | `utils.ts`（`cn`などの汎用ユーティリティ） |
| `public/` | アイコン・プレースホルダー画像などの静的アセット |
| `slide/` | フローチャート・スライド構成のドキュメント（`flow-chart.md`、`slide-outline.md`） |
| `styles/` | グローバルスタイル（`app/globals.css`と重複気味なので変更時は両方確認） |

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

## Code Style

- 言語: TypeScript / React 19 / Next.js App Router
- UIコンポーネント: `components/ui/`はshadcn CLIで生成・管理されたものとして扱い、手書きせず既存セットとの一貫性を保つ
- パスエイリアス: `@/*`はリポジトリルートにマッピング（`tsconfig.json`）。`components.json`のshadcn aliases（`@/components`、`@/lib`、`@/hooks`、`@/components/ui`）と整合させる
- タイプ相性表（`CHART`）や18タイプリスト、Tailwindカラーマップは`app/page.tsx`にハードコードされた定数であり、PokeAPI由来ではない。相性ルールを変更する場合はこのオブジェクトを直接編集する
- 複数タイプの効果倍率は各防御側タイプに対する倍率の積（例: ほのお×みず/くさ = 0.5 × 2.0 = 1.0）。`groupedResults`内の`reduce`で計算

## Boundaries

- `src/app/api/pokemon/route.ts`は編集しない（App Routerからは解決されないデッドコード）。ポケモン検索APIの正は`app/api/pokemon/route.ts`のみ
- `next.config.mjs`の`typescript.ignoreBuildErrors: true`は`npm run build`を型エラーで失敗させない設定。外す場合は既存の型エラーが顕在化するため事前に確認を求める
- `.env*`ファイルを変更・コミットしない
- 重要な設計判断（タイプ相性ロジックの変更、UIライブラリの入れ替えなど）を独断で進めない。必ず確認を求める

## Workflow

- 型エラーの検出には`npm run build`ではなく`tsc`やエディタの診断、または`npm run lint`を使う
- タイプ相性ロジックを変更した際は、複数タイプの組み合わせ（例: ほのお×くさ→みず）で手動確認する
- `pokemon.json`を再取得する際は差分取得の前提（既存データが連続したID範囲であること）を崩さないよう注意する
