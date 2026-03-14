"use client";
import { useState } from "react";

export default function UploadPage() {
  const [result, setResult] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/media", { method: "POST", body: form });
        setResult(JSON.stringify(await res.json(), null, 2));
      }}
    >
      <h2>上传视频</h2>
      <input name="studentId" placeholder="studentId" required />
      <input type="file" name="file" accept="video/*" required />
      <input name="sourceType" defaultValue="upload" />
      <button type="submit">上传并创建 session</button>
      <pre>{result}</pre>
    </form>
  );
}
