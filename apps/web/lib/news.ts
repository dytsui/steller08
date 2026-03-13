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
    .trim();
}

function pickCategory(title: string) {
  const lower = title.toLowerCase();
  if (/(pga|lpga|tour|大师赛|公开赛|锦标赛)/i.test(lower)) return "赛事";
  if (/(球杆|装备|driver|iron|putter|gear)/i.test(lower)) return "装备";
  if (/(教学|挥杆|练习|coach|drill|tempo)/i.test(lower)) return "教学";
  return "资讯";
}

function parseRss(xml: string): NewsItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return blocks.slice(0, 8).map((block, index) => {
    const title = clean(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "高尔夫资讯");
    const url = clean(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "https://news.google.com/search?q=%E9%AB%98%E5%B0%94%E5%A4%AB");
    const source = clean(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "Google News");
    const publishedAt = clean(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
    return {
      id: `news_${index}`,
      title,
      url,
      source,
      publishedAt,
      category: pickCategory(title)
    };
  });
}

export async function fetchChineseGolfNews(): Promise<NewsItem[]> {
  const endpoints = [
    process.env.NEWS_API_BASE,
    "https://news.google.com/rss/search?q=%E9%AB%98%E5%B0%94%E5%A4%AB%20OR%20PGA%20OR%20LPGA&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
  ].filter(Boolean) as string[];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) continue;
      const text = await res.text();
      const items = parseRss(text);
      if (items.length) return items;
    } catch {
      continue;
    }
  }

  return [];
}
