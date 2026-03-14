"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { fmtDate } from '@/lib/utils';
import { getCurrentStudentId, subscribeCurrentStudent } from '@/lib/current-student';
import { analysisPathForPortal } from '@/lib/portal-paths';

const sourceLabels: Record<string, string> = {
  camera: '普通实拍',
  upload: '普通上传',
  'screen-camera': 'Screen 实拍',
  'screen-upload': 'Screen 上传'
};

export function HistoryList() {
  const pathname = usePathname();
  const portal = pathname.startsWith('/pro') ? 'pro' : 'app';
  const [items, setItems] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');

  async function refresh(targetStudentId?: string) {
    const id = targetStudentId ?? getCurrentStudentId();
    setStudentId(id);
    const qs = id ? `?studentId=${encodeURIComponent(id)}` : '';
    const res = await fetch(`/api/history${qs}`, { cache: 'no-store' });
    const data = await res.json();
    setItems(data.history ?? []);
  }

  useEffect(() => {
    refresh();
    return subscribeCurrentStudent((id) => refresh(id));
  }, []);

  return (
    <Card>
      <div className="stack">
        <div className="surface-title-row">
          <div>
            <h2 className="section-title">Session 列表</h2>
            <div className="surface-subtitle">{studentId ? `当前学员：${studentId}` : '当前未选择学员，显示全部记录'}</div>
          </div>
          <span className="badge">共 {items.length} 条</span>
        </div>

        {items.length ? (
          <div className="history-grid">
            {items.map((item: any) => (
              <Link key={item.id} href={analysisPathForPortal(portal, item.id)} className="timeline-card">
                <div className="row-between">
                  <strong>{item.studentName || item.studentId}</strong>
                  <span className="badge badge-accent">{item.score ?? '--'}</span>
                </div>
                <div className="muted">{sourceLabels[item.sourceType] ?? item.sourceType}</div>
                <div className="muted">{fmtDate(item.createdAt)}</div>
                <div className="muted">状态 {item.status}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>还没有历史记录</strong>
            <span>先去拍摄或上传一条视频，正式结果写库后这里会自动出现。</span>
          </div>
        )}
      </div>
    </Card>
  );
}
