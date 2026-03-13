import { getEnv } from '@/lib/cloudflare';

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
  category?: string;
  summary?: string;
  imageUrl?: string;
  fetchedAt?: string;
};

function clean(input: string) {
  return input
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

function pickCategory(title: string) {
  const lower = title.toLowerCase();
  if (/(pga|lpga|tour|masters|open|championship|公开赛|锦标赛|巡回赛|dp world)/i.test(lower)) return '赛事';
  if (/(training|instruction|coach|drill|tempo|教学|挥杆|练习|lesson)/i.test(lower)) return '教学';
  if (/(player|球手|冠军|名将|明星)/i.test(lower)) return '球手';
  if (/(球杆|装备|driver|iron|putter|gear)/i.test(lower)) return '装备';
  return '资讯';
}

function blockValue(block: string, tag: string) {
  return clean(block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? '');
}

function parseRss(xml: string): NewsItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return blocks.slice(0, 24).map((block, index) => {
    const title = blockValue(block, 'title') || '高尔夫资讯';
    const url = clean(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? block.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? 'https://news.google.com/search?q=golf');
    const source = blockValue(block, 'source') || blockValue(block, 'name') || 'Golf News';
    const summary = blockValue(block, 'description') || blockValue(block, 'summary');
    const publishedAt = blockValue(block, 'pubDate') || blockValue(block, 'updated');
    const imageUrl = clean(block.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ?? block.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ?? '');
    return {
      id: `news_${index}_${title.slice(0, 24)}`,
      title,
      url,
      source,
      summary,
      imageUrl: imageUrl || undefined,
      publishedAt,
      category: pickCategory(title)
    };
  });
}

async function readCache(lang: 'zh' | 'en') {
  const result = await getEnv().DB.prepare(`
    SELECT id, title, summary, image_url as imageUrl, source, published_at as publishedAt,
           url, category, fetched_at as fetchedAt
    FROM news_cache
    WHERE lang = ?1
    ORDER BY datetime(COALESCE(published_at, fetched_at)) DESC, fetched_at DESC
    LIMIT 8
  `).bind(lang).all();
  return (result.results ?? []) as NewsItem[];
}

async function writeCache(lang: 'zh' | 'en', items: NewsItem[]) {
  const fetchedAt = new Date().toISOString();
  await getEnv().DB.batch([
    getEnv().DB.prepare(`DELETE FROM news_cache WHERE lang = ?1`).bind(lang),
    ...items.map((item, index) => getEnv().DB.prepare(`
      INSERT INTO news_cache (id, lang, title, summary, image_url, source, published_at, url, category, fetched_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    `).bind(
      `${lang}_${index}_${item.title.slice(0, 32)}`,
      lang,
      item.title,
      item.summary ?? null,
      item.imageUrl ?? null,
      item.source ?? null,
      item.publishedAt ?? null,
      item.url,
      item.category ?? null,
      fetchedAt
    ))
  ]);
}

async function fetchFeeds(endpoints: Array<{ url: string; lang: 'zh' | 'en' }>) {
  const merged: NewsItem[] = [];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, { cache: 'no-store', headers: { 'user-agent': 'Steller08/1.0' } });
      if (!res.ok) continue;
      const text = await res.text();
      merged.push(...parseRss(text));
    } catch {
      continue;
    }
  }
  const seen = new Set<string>();
  return merged.filter((item) => {
    const key = item.title.toLowerCase();
    if (!item.url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchChineseGolfNews(): Promise<{ items: NewsItem[]; cached: boolean; updatedAt?: string }> {
  const endpoints = [
    { url: 'https://news.google.com/rss/search?q=%E9%AB%98%E5%B0%94%E5%A4%AB%20OR%20PGA%20OR%20LPGA%20OR%20%E6%8C%A5%E6%9D%86%20OR%20%E9%AB%98%E5%B0%94%E5%A4%AB%E6%95%99%E5%AD%A6&hl=zh-CN&gl=CN&ceid=CN:zh-Hans', lang: 'zh' as const },
    { url: 'https://news.google.com/rss/search?q=PGA%20OR%20LPGA%20OR%20DP%20World%20Tour%20golf%20instruction&hl=en-US&gl=US&ceid=US:en', lang: 'en' as const },
    { url: 'https://news.google.com/rss/search?q=golf%20training%20players%20equipment&hl=en-US&gl=US&ceid=US:en', lang: 'en' as const }
  ];

  const live = await fetchFeeds(endpoints);
  if (live.length) {
    const zhFirst = live
      .sort((a, b) => (a.title.match(/[\u4e00-\u9fff]/) ? -1 : 1) - (b.title.match(/[\u4e00-\u9fff]/) ? -1 : 1))
      .slice(0, 8);
    await writeCache('zh', zhFirst);
    return {
      items: zhFirst,
      cached: false,
      updatedAt: new Date().toISOString()
    };
  }

  const cached = await readCache('zh');
  return {
    items: cached,
    cached: true,
    updatedAt: cached[0]?.fetchedAt
  };
}
