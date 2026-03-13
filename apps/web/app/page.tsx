import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchChineseGolfNews } from "@/lib/news";

export const dynamic = "force-dynamic";

const heroStats = [
  { label: "正式链路", value: "轻分析 → 深分析" },
  { label: "输入模式", value: "4 种" },
  { label: "数据落点", value: "D1 / R2" }
];

const modes = [
  {
    title: "普通模式",
    subtitle: "直接拍人或上传原始挥杆视频",
    bullets: ["实时骨架 + 9 宫格", "首扫 Tempo", "录制后正式深分析"],
    href: "/capture"
  },
  {
    title: "Screen Mode",
    subtitle: "对投影仪、电视、电脑屏幕、平板屏幕做挥杆分析",
    bullets: ["屏幕区域检测", "裁边 / 纠偏 / 增亮", "录制后进入 Screen 深分析"],
    href: "/capture?mode=screen"
  }
];

const actions = [
  { title: "进入用户端", desc: "拍摄 / 上传 / 我的分析 / 我的训练", href: "/login" },
  { title: "进入Pro端", desc: "管理用户 / 复盘分析 / 邀请绑定", href: "/login" },
  { title: "开始拍摄", desc: "普通实拍实时", href: "/capture" },
  { title: "上传视频", desc: "普通上传正式分析", href: "/upload" },
  { title: "Screen Mode", desc: "屏拍首扫 + 深分析", href: "/upload?mode=screen" },
  { title: "训练计划", desc: "分数 / Tempo / 问题趋势", href: "/training" }
];

export default async function HomePage() {
  const news = await fetchChineseGolfNews();

  return (
    <main className="page stack">
      <section className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="kicker">precision golf analysis</span>
            <h1 className="headline">精准分析 进阶训练</h1>
            <p className="subhead">
              Steller08 现在升级为“用户端 / Pro端”双门户：用户端负责拍摄、上传、分析与训练闭环，Pro端负责用户管理、复盘、训练计划与邀请绑定。底层仍坚持真实首扫 → Render 深分析 → D1 / R2 落库。
            </p>

            <div className="hero-actions">
              <Link href="/login"><span className="button button-primary">进入用户端</span></Link>
              <Link href="/login"><span className="button button-neutral">进入Pro端</span></Link>
              <Link href="/capture?mode=screen"><span className="button button-neutral">Screen Mode</span></Link>
            </div>

            <div className="hero-stats">
              {heroStats.map((item) => (
                <div key={item.label} className="stat-tile">
                  <div className="muted">{item.label}</div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-screen">
              <div className="hero-scoreboard">
                <div className="score-chip"><span>实时阶段</span><strong>Top</strong></div>
                <div className="score-chip"><span>Tempo</span><strong>3.0</strong></div>
                <div className="score-chip"><span>评分</span><strong>86</strong></div>
              </div>
            </div>
            <div className="hero-course" />
          </div>
        </div>
      </section>

      <section className="hero-news stack">
        <div className="surface-title-row">
          <div>
            <span className="kicker">golf live feed</span>
            <h2 className="section-title">高尔夫新闻流</h2>
          </div>
          <Link href="/settings" className="badge">可接自定义新闻源</Link>
        </div>

        <div className="ticker-row">
          {["赛事", "教学", "装备", "巡回赛热点", "PGA", "LPGA"].map((item) => (
            <span key={item} className="ticker-chip">{item}</span>
          ))}
        </div>

        {news.length ? (
          <div className="news-grid">
            {news.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="news-card">
                <div className="news-meta">
                  <span className="badge">{item.category ?? "资讯"}</span>
                  <span>{item.source ?? "Golf News"}</span>
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
            <span>API 或外部 RSS 不可用时不会填充假新闻。部署后接通新闻源即可显示真实资讯。</span>
          </div>
        )}
      </section>

      <section className="stack">
        <div className="surface-title-row">
          <div>
            <span className="kicker">quick operations</span>
            <h2 className="section-title">功能操作带</h2>
          </div>
        </div>
        <div className="stats-grid">
          {actions.map((item) => (
            <Link key={item.href} href={item.href} className="summary-card">
              <div className="row-between">
                <strong>{item.title}</strong>
                <span className="badge">进入</span>
              </div>
              <div className="muted">{item.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="modes-grid">
        {modes.map((mode) => (
          <Card key={mode.title}>
            <div className="stack">
              <div>
                <span className="kicker">analysis mode</span>
                <h2 className="section-title">{mode.title}</h2>
                <p className="subhead">{mode.subtitle}</p>
              </div>
              <ul className="list-plain">
                {mode.bullets.map((bullet) => (
                  <li key={bullet} className="news-link">{bullet}</li>
                ))}
              </ul>
              <Link href={mode.href}><span className="button button-primary">进入 {mode.title}</span></Link>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
