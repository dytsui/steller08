"use client";
import { useState } from "react";

export default function Page() {
  const [resp, setResp] = useState("");
  return <form onSubmit={async (e)=>{e.preventDefault(); const fd=new FormData(e.currentTarget); const r=await fetch('/api/media',{method:'POST',body:fd}); setResp(JSON.stringify(await r.json(),null,2));}}>
    <h2>上传视频</h2>
    <input name="studentId" placeholder="studentId" required />
    <input name="sourceType" defaultValue="upload" required />
    <input type="file" name="file" accept="video/*" required />
    <button type="submit">上传并创建session</button>
    <pre>{resp}</pre>
  </form>;
}
