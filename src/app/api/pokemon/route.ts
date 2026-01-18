import { NextResponse } from 'next/server';
import pokemonData from '@/src/data/pokemon.json';

/**
 * ひらがなをカタカナに変換する関数
 * @param str 文字列
 * @returns カタカナに統一された文字列
 */
function toKatakana(str: string) {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  // 1. 検索ワードをカタカナに変換
  const normalizedQuery = toKatakana(query);

  // 2. 検索実行
  const suggestions = pokemonData
  .filter(p => toKatakana(p.name).includes(normalizedQuery))
  .sort((a, b) => {
    const aNorm = toKatakana(a.name);
    const bNorm = toKatakana(b.name);
    
    // 1. 前方一致を優先
    const aStarts = aNorm.startsWith(normalizedQuery);
    const bStarts = bNorm.startsWith(normalizedQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // 2. 文字数が短い順
    return a.name.length - b.name.length;
  })
  .slice(0, 10)

  return NextResponse.json(suggestions);
}