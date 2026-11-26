import type { ReactNode } from 'react';
import SnowBackground from '@/components/ui/SnowBackground';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <SnowBackground />
      <div className="relative z-10 flex flex-col min-h-dvh">
        <AdminNav />
        <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
