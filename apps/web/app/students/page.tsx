import { ApiForm } from "@/components/ApiForm";

export default async function StudentsPage() {
  return (
    <div>
      <h2>创建学员</h2>
      <ApiForm action="/api/students" fields={[{ name: "name", label: "姓名" }, { name: "level", label: "水平" }, { name: "dominantHand", label: "惯用手" }, { name: "handicap", label: "差点" }, { name: "notes", label: "备注" }]} />
    </div>
  );
}
