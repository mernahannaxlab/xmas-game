import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مسابقة الكريسماس — فطوطة',
  description: 'مسابقة كريسماسية مبهجة مع فطوطة',
  keywords: ['christmas', 'game show', 'مسابقة', 'كريسماس', 'تحدي'],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
