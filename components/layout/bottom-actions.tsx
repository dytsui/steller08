import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BottomActions() {
  return (
    <div className="action-strip">
      <Link href="/app/capture"><Button tone="primary">开始拍摄</Button></Link>
      <Link href="/app/upload"><Button tone="neutral">上传视频</Button></Link>
      <Link href="/app/capture?mode=screen"><Button tone="neutral">Screen Mode</Button></Link>
      <Link href="/app/history"><Button tone="neutral">查看记录</Button></Link>
      <Link href="/app/training"><Button tone="neutral">训练计划</Button></Link>
    </div>
  );
}
