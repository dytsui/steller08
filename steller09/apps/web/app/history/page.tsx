async function load() { const r = await fetch('http://localhost:3000/api/history', { cache: 'no-store' }).catch(()=>null); return r?.ok ? (await r.json()).items as Array<Record<string,unknown>> : []; }
export default async function Page(){ const items=await load(); return <div><h2>历史</h2>{items.map((x,i)=><div key={i} className="card"><pre>{JSON.stringify(x,null,2)}</pre></div>)}</div>; }
