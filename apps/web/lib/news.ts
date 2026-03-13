export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
  category?: string;
};

function clean(input: string) {
  return input
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

function pickCategory(title: string) {
  const lower = title.toLowerCase();
  if (/(pga|lpga|tour|masters|open|championship|公开赛|锦标赛|巡回赛)/i.test(lower)) return "赛事";
  if (/(player|球手|冠军|名将|明星)/i.test(lower)) return "球手";
  if (/(球杆|装备|driver|iron|putter|gear)/i.test(lower)) return "装备";
  if (/(instruction|swing|coach|drill|tempo|教学|挥杆|练习)/i.test(lower)) return "教学";
  return "资讯";
}

function parseRss(xml: string): NewsItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return blocks.slice(0, 20).map((block, index) => {
    const title = clean(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "高尔夫资讯");
    const url = clean(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? block.match(/<link[^>]*href="([^"]+)"/ )?.[1] ?? "https://news.google.com/search?q=golf");
    const source = clean(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? block.match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? "Golf News");
    const publishedAt = clean(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? block.match(/<updated>([\s\S]*?)<\/updated>/)?.[1] ?? "");
    return { id: `news_${index}_${title.slice(0, 12)}`, title, url, source, publishedAt, category: pickCategory(title) };
  });
}

export async function fetchChineseGolfNews(): Promise<NewsItem[]> {
  const endpoints = [
    'https://news.google.com/rss/search?q=%E9%AB%98%E5%B0%94%E5%A4%AB%20OR%20PGA%20OR%20LPGA&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    'https://news.google.com/rss/search?q=PGA%20OR%20LPGA%20golf%20instruction&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=golf%20players%20OR%20golf%20tour&hl=en-US&gl=US&ceid=US:en'
  ];

  const merged: NewsItem[] = [];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
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
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}
