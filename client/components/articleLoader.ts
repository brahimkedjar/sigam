// =============================================================
// File: data/articleLoader.ts
// Loads predefined Arabic articles for a permit and converts
// them into positioned canvas elements
// =============================================================
import { v4 as uuidv4 } from 'uuid';
import type { ArticleItem, PermisElement } from './types';

// NOTE: adjust this import path to wherever you place the JSON file(s)
import PXC5419 from './permis-5419-pxc.json';

export async function loadArticlesForPermit(initialData: any): Promise<ArticleItem[]> {
  // You can branch by typePermis, code_demande, or other fields
  // Here we return the 5419 PXC set if code matches, else empty
  try {
    if (
      String(initialData?.code_demande || '').toLowerCase().includes('5419') ||
      String(initialData?.code_demande || '').toLowerCase().includes('pxc')
    ) {
      return (PXC5419.articles || []) as ArticleItem[];
    }
  } catch (e) {
    // ignore
  }
  return (PXC5419.articles || []) as ArticleItem[]; // fallback: provide something
}

export function toArticleElements({
  articleIds,
  articles,
  yStart,
  x,
  width,
  fontFamily,
}: {
  articleIds: string[];
  articles: ArticleItem[];
  yStart: number;
  x: number;
  width: number;
  fontFamily: string;
}): PermisElement[] {
  let y = yStart;
  const blocks: PermisElement[] = [];

  for (const id of articleIds) {
    const a = articles.find((art) => art.id === id);
    if (!a) continue;

    // --- Title (المادة 1) ---
    blocks.push({
      id: uuidv4(),
      type: 'text',
      x,
      y,
      width,
      text: a.title, // "المادة 1"
      language: 'ar',
      direction: 'rtl',
      fontSize: 16,
      fontFamily,
      color: '#000000',
      draggable: true,
      textAlign: 'right',
      lineHeight: 1.3,
      isArticle: true,
    });
    y += 30; // spacing

    // --- Content (full Arabic text) ---
    blocks.push({
      id: uuidv4(),
      type: 'text',
      x,
      y,
      width,
      text: a.content, // "على صاحب الرخصة احترام التنظيمات ..."
      language: 'ar',
      direction: 'rtl',
      fontSize: 14,
      fontFamily,
      color: '#000000',
      draggable: true,
      textAlign: 'right',
      lineHeight: 1.4,
      isArticle: true,
    });
   y += 110;  // spacing before next article
  }

  return blocks;
}
