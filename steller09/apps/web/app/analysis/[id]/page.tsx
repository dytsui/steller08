import Link from "next/link";
export default async function Page({params}:{params:Promise<{id:string}>}){ const {id}=await params; return <div><h2>分析详情 {id}</h2><Link href={`/analysis/${id}/issues`}>查看 issues</Link></div>; }
