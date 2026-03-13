import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BottomActions() {
  return (
    <div className="action-strip">
      <Link href="/capture"><Button tone="primary">开始拍摄</Button></Link>
      <Link href="/upload"><Button tone="neutral">上传原视频</Button></Link>
      <Link href="/capture?mode=screen"><Button tone="neutral">Screen Mode</Button></Link>
      <Link href="/history"><Button tone="neutral">查看记录</Button></Link>
      <Link href="/training"><Button tone="neutral">训练计划</Button></Link>
    </div>
  );
}
