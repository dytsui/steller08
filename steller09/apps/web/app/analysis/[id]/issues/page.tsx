import Link from "next/link";
export default async function Page({params}:{params:Promise<{id:string}>}){ const {id}=await params; return <ul><li><Link href={`/analysis/${id}/issues/tempo_inconsistent`}>tempo_inconsistent</Link></li></ul>; }
