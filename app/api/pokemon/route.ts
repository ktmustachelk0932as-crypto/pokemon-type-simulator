/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

type Pokemon = { name: string; types: string[] };

/**
 * ひらがなをカタカナに変換する関数
 * @param str 文字列
 * @returns カタカナに統一された文字列
 */
function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * ポケモン名で検索するAPI
 * GET /api/pokemon?q=カイ
 * ひらがな入力にも対応（自動的にカタカナに変換して検索）
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  try {
    // JSONファイルを読み込む
    const filePath = join(process.cwd(), 'src', 'data', 'pokemon.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const pokemonData: Pokemon[] = JSON.parse(fileContents);

    // 検索ワードをカタカナに変換（ひらがな入力にも対応）
    const normalizedQuery = toKatakana(query);

    // カタカナに変換して検索（前方一致を優先）
    const suggestions = pokemonData
      .filter((p: Pokemon) => {
        const normalizedName = toKatakana(p.name);
        return normalizedName.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aNorm = toKatakana(a.name);
        const bNorm = toKatakana(b.name);
        
        // 前方一致を優先
        const aStarts = aNorm.startsWith(normalizedQuery);
        const bStarts = bNorm.startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // 文字数が短い順
        return a.name.length - b.name.length;
      })
      .slice(0, 10);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error reading pokemon data:', error);
    return NextResponse.json({ error: 'Failed to load pokemon data' }, { status: 500 });
  }
}

