import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OPC招聘系统',
  description: '一人公司智能招聘管理平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
