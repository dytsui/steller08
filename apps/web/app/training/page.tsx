import { TrainingBoard } from "@/components/training/training-board";

export default function TrainingPage() {
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">growth board</span>
        <h1 className="page-title">成长曲线与训练计划</h1>
        <p className="subhead">聚合正式分析记录，查看分数趋势、Tempo 趋势、问题数量趋势与 drill 建议。</p>
      </section>
      <TrainingBoard />
    </main>
  );
}
