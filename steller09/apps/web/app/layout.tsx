import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <main>
          <h1>steller09</h1>
          <nav>
            <Link href="/">首页</Link><Link href="/login">登录</Link><Link href="/register">注册</Link><Link href="/students">学员</Link><Link href="/upload">上传</Link><Link href="/history">历史</Link><Link href="/pro">Pro</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
