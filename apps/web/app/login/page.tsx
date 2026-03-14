import { ApiForm } from "@/components/ApiForm";
export default function LoginPage() {
  return <ApiForm action="/api/auth/login" fields={[{ name: "email", label: "邮箱" }, { name: "password", label: "密码", type: "password" }]} />;
}
