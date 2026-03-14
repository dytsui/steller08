import { ApiForm } from "@/components/ApiForm";
export default function Page() { return <ApiForm action="/api/auth/register" fields={[{name:"email",label:"邮箱"},{name:"password",label:"密码",type:"password"},{name:"displayName",label:"昵称"},{name:"role",label:"角色(user/pro/admin)"}]} />; }
