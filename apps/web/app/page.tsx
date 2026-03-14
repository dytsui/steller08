import Link from "next/link";
import { fetchChineseGolfNews } from "@/lib/news";

export const dynamic = "force-dynamic";

const tips = [
  '保持上杆宽度，别急着用手卷杆。',
  'Top 到 Impact 的转换顺序决定击球稳定性。',
  '头部稳定，低点击球更容易重复。',
  '髋部先带动，减少外下切。',
  '收杆能站稳，往往说明顺序更对。',
  '击球前保持脊柱前倾，不要提前起身。'
];

const promos = [
  '上传挥杆，快速找到最该先修的问题。',
  '实时录制，马上看到动作提示。',
  '正式分析生成训练计划，知道下一步怎么练。',
  '标准模板对比，快速看出关键差距。',
  '持续记录训练结果，追踪技术是否真的进步。'
];

const modes = [
  {
    title: '普通模式',
    subtitle: '直接拍人或上传原始挥杆视频',
    bullets: ['实时骨架与关键指标', '录制结束进入正式分析', '结果同步到记录与训练'],
    href: '/login'
  },
  {
    title: 'Screen Mode',
    subtitle: '对投影、电视、电脑或平板里的挥杆画面进行分析',
    bullets: ['屏幕识别与纠偏增强', '适合练习场回放与教学复盘', '后续进入正式分析结果'],
    href: '/login'
  }
];

export default async function HomePage() {
  const news = await fetchChineseGolfNews();

  return (
    <main className="page stack">
      <section className="hero-shell home-hero-shell">
        <div className="hero-grid home-hero-grid">
          <div className="hero-copy">
            <span className="kicker">ai golf improvement platform</span>
            <h1 className="headline">看懂问题，马上开始提升挥杆技术</h1>
            <p className="subhead home-subhead">
              Steller08 把挥杆分析变成真正可执行的训练闭环：先找到主问题，再给出 3 秒纠正提示、阶段诊断、关键帧对比与训练计划。
            </p>
            <div className="hero-actions home-main-actions">
              <Link href="/login"><span className="button button-primary">进入用户端</span></Link>
              <Link href="/login"><span className="button button-neutral">进入 Pro端</span></Link>
            </div>
          </div>
          <div className="hero-visual home-hero-visual" aria-hidden="true">
            <div className="hero-screen hero-screen-polish">
              <div className="hero-screen-copy">
                <span className="badge badge-accent">主问题优先级</span>
                <span className="badge">阶段式挥杆诊断</span>
                <span className="badge">关键帧对比</span>
                <span className="badge">AI训练计划</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ticker-board stack">
        <div className="ticker-strip">
          <span className="ticker-label">技术要点</span>
          <div className="ticker-track">
            {[...tips, ...tips].map((item, index) => <span key={`${item}-${index}`} className="ticker-item">{item}</span>)}
          </div>
        </div>
        <div className="ticker-strip ticker-strip-secondary">
          <span className="ticker-label">提升方式</span>
          <div className="ticker-track">
            {[...promos, ...promos].map((item, index) => <span key={`${item}-${index}`} className="ticker-item">{item}</span>)}
          </div>
        </div>
      </section>

      <section className="news-carousel stack">
        <div className="surface-title-row">
          <div>
            <span className="kicker">pro golf news</span>
            <h2 className="section-title">职业高尔夫新闻</h2>
          </div>
          <Link href="/login" className="badge">登录后查看分析</Link>
        </div>
        {news.length ? (
          <div className="news-grid home-news-grid">
            {news.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="news-card news-card-featured">
                <div className="news-meta">
                  <span className="badge">{item.category ?? '资讯'}</span>
                  <span>{item.source ?? 'Golf News'}</span>
                  {item.publishedAt ? <span>{item.publishedAt}</span> : null}
                </div>
                <h3 className="news-title">{item.title}</h3>
                <span className="muted">打开原文</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>新闻流暂未返回数据</strong>
            <span>将继续显示最近成功缓存或下一次刷新后的真实新闻。</span>
          </div>
        )}
      </section>

      <section className="modes-grid">
        {modes.map((mode) => (
          <div key={mode.title} className="card stack mode-card-refined">
            <div>
              <span className="kicker">mode</span>
              <h2 className="section-title">{mode.title}</h2>
              <p className="subhead">{mode.subtitle}</p>
            </div>
            <ul className="list-plain">
              {mode.bullets.map((bullet) => (
                <li key={bullet} className="news-link">{bullet}</li>
              ))}
            </ul>
            <Link href={mode.href}><span className="button button-primary">登录后进入</span></Link>
          </div>
        ))}
      </section>
    </main>
  );
}
