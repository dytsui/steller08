import { ApiForm } from "@/components/ApiForm";
export default function Page() { return <ApiForm action="/api/students" fields={[{name:"name",label:"姓名"},{name:"dominantHand",label:"惯用手"},{name:"level",label:"水平"},{name:"handicap",label:"差点"},{name:"notes",label:"备注"}]} />; }
