export default async function Page({params}:{params:Promise<{id:string;issueCode:string}>}){ const {id,issueCode}=await params; return <p>{id} / {issueCode}</p>; }
