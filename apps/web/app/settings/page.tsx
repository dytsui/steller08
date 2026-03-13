import { Card } from "@/components/ui/card";

const deployItems = [
  "Cloudflare D1 绑定结构化数据表",
  "VIDEOS / KEYFRAMES / SHARES / EXPORTS 四个 R2 桶",
  "Render FastAPI 分析服务地址与 token",
  "Gemini API Key、Base URL、Model",
  "可选新闻 RSS / API 地址"
];

export default function SettingsPage() {
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">deployment settings</span>
        <h1 className="page-title">设置与部署说明</h1>
        <p className="subhead">此页只说明环境绑定项，不伪造任何云端状态。未接通环境时，页面功能保持前端侧可用，云端链路会明确报错。</p>
      </section>
      <div className="settings-grid">
        <Card>
          <div className="stack">
            <h2 className="section-title">部署前必填</h2>
            <ul className="list-plain">
              {deployItems.map((item) => <li key={item} className="news-link">{item}</li>)}
            </ul>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <h2 className="section-title">运行原则</h2>
            <div className="news-link">1. 先真实分析，再生成 AI 报告。</div>
            <div className="news-link">2. 后端没通就明确报错，不回退成假结果。</div>
            <div className="news-link">3. localStorage 只做当前学员缓存，不当主数据库。</div>
            <div className="news-link">4. 分享、历史、训练页只读取正式落库结果。</div>
          </div>
        </Card>
      </div>
    </main>
  );
}
