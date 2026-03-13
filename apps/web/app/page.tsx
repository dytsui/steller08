import Link from 'next/link';
import { fetchChineseGolfNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

const topTickerItems = [
  '保持上杆宽度',
  '头部保持稳定',
  '髋部先启动',
  '上传挥杆，快速发现关键问题',
  '录制挥杆，实时查看动作提示',
  '正式分析，获得训练计划',
  '对比标准模板，发现差距',
  '持续记录，追踪进步趋势'
];

const modes = [
  {
    title: '用户端',
    subtitle: '给学员和普通用户使用',
    bullets: ['拍摄与上传', '查看分析与训练计划', '持续追踪成长趋势'],
    href: '/login'
  },
  {
    title: 'Pro端',
    subtitle: '给教练、工作室、练习场与机构使用',
    bullets: ['管理自己学员', '代学员拍摄与上传', '复盘与下发训练重点'],
    href: '/login'
  }
];

export default async function HomePage() {
  const newsPayload = await fetchChineseGolfNews();
  const news = newsPayload.items;

  return (
    <main className="page stack">
      <section className="top-ticker-strip" aria-label="golf value ticker">
        <span className="ticker-label">挥杆训练重点</span>
        <div className="ticker-track">
          {[...topTickerItems, ...topTickerItems].map((item, index) => <span key={`${item}-${index}`} className="ticker-item">{item}</span>)}
        </div>
      </section>

      <section className="hero-shell home-hero-shell">
        <div className="hero-grid home-hero-grid">
          <div className="hero-copy">
            <span className="kicker">swing improvement</span>
            <h1 className="headline">真正把挥杆分析变成训练闭环</h1>
            <p className="subhead home-subhead">
              先做真实分析，再生成简洁可执行的训练输出。上传、拍摄、查看分析、复盘训练和追踪成长，都围绕真正有用的挥杆改进来设计。
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
                <span className="badge">3 秒纠正提示</span>
                <span className="badge">阶段式挥杆诊断</span>
                <span className="badge">标准模板对比</span>
                <span className="badge">训练计划</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="modes-grid">
        {modes.map((mode) => (
          <div key={mode.title} className="card stack mode-card-refined">
            <div>
              <span className="kicker">portal</span>
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

      <section className="card stack">
        <div className="surface-title-row">
          <div>
            <span className="kicker">mode guide</span>
            <h2 className="section-title">模式说明</h2>
          </div>
        </div>
        <div className="timeline-grid">
          <div className="timeline-card">
            <strong>普通模式</strong>
            <span className="muted">直接拍人或上传原始挥杆视频，适合自己的练习录制与上传复盘。</span>
          </div>
          <div className="timeline-card">
            <strong>Screen Mode</strong>
            <span className="muted">对投影仪、电视、电脑屏幕或平板中的挥杆回放做分析，适合教学回看与练习场复盘。</span>
          </div>
        </div>
      </section>

      <section className="news-carousel stack">
        <div className="surface-title-row">
          <div>
            <span className="kicker">pro golf news</span>
            <h2 className="section-title">职业高尔夫新闻</h2>
          </div>
          <div className="stack" style={{ gap: 4, justifyItems: 'end' }}>
            <span className="badge">{newsPayload.cached ? '缓存内容' : '实时刷新'}</span>
            {newsPayload.updatedAt ? <span className="muted">更新时间 {new Date(newsPayload.updatedAt).toLocaleString('zh-CN')}</span> : null}
          </div>
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
                {item.summary ? <p className="muted">{item.summary}</p> : null}
                <span className="muted">打开原文</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>新闻流暂未返回内容</strong>
            <span>当前会优先显示最近一次成功拉取并写入缓存的真实新闻。</span>
          </div>
        )}
      </section>

      <section className="stats-grid">
        <div className="card stack">
          <strong>次级入口</strong>
          <div className="hero-actions">
            <Link href="/login"><span className="button button-neutral">上传视频</span></Link>
            <Link href="/login"><span className="button button-neutral">开始拍摄</span></Link>
            <Link href="/login"><span className="button button-neutral">查看训练</span></Link>
          </div>
        </div>
        <div className="card stack">
          <strong>产品原则</strong>
          <span className="muted">没有真实首扫就不显示快速结果，没有深分析回写就不显示正式报告。</span>
        </div>
      </section>
    </main>
  );
}
