"use client";
import { useState } from "react";

export function ApiForm({ action, fields }: { action: string; fields: Array<{ name: string; label: string; type?: string }> }) {
  const [output, setOutput] = useState<string>("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = Object.fromEntries(fd.entries());
        const res = await fetch(action, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        setOutput(JSON.stringify(await res.json(), null, 2));
      }}
    >
      {fields.map((f) => (
        <div key={f.name}>
          <label>{f.label}</label>
          <input name={f.name} type={f.type ?? "text"} required />
        </div>
      ))}
      <button type="submit">提交</button>
      <pre>{output}</pre>
    </form>
  );
}
