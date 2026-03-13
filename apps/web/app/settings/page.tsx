import { Card } from "@/components/ui/card";

const deployItems = [
  "正式分析服务地址与访问密钥",
  "媒体存储桶与关键帧图存储",
  "AI 报告服务密钥",
  "新闻源或 RSS 地址",
  "站点访问地址"
];

export default function SettingsPage() {
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">settings</span>
        <h1 className="page-title">设置说明</h1>
        <p className="subhead">此页只说明需要接通的外部服务，不会伪造任何线上状态。未接通时，相关链路会明确报错。</p>
      </section>
      <div className="settings-grid">
        <Card>
          <div className="stack">
            <h2 className="section-title">接通前请准备</h2>
            <ul className="list-plain">
              {deployItems.map((item) => <li key={item} className="news-link">{item}</li>)}
            </ul>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <h2 className="section-title">运行原则</h2>
            <div className="news-link">1. 先真实分析，再生成 AI 报告。</div>
            <div className="news-link">2. 服务没通就明确报错，不回退成假结果。</div>
            <div className="news-link">3. 当前档案只做缓存，不当主数据。</div>
            <div className="news-link">4. 分享、记录、训练页只读取正式结果。</div>
          </div>
        </Card>
      </div>
    </main>
  );
}
