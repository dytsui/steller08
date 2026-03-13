import { HistoryList } from "@/components/history/history-list";

export default function HistoryPage() {
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">history center</span>
        <h1 className="page-title">历史记录</h1>
        <p className="subhead">按当前学员过滤 session，按时间排序，点击即可进入分析详情。</p>
      </section>
      <HistoryList />
    </main>
  );
}
