import Link from 'next/link';
import GlowCard from '@/components/ui/GlowCard';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-yellow-300">لوحة الإدارة</h1>
        <p className="mt-1 text-sm text-red-400">مسابقة الكريسماس — فطوطة</p>
      </div>

      <GlowCard className="p-5" glow="red">
        <h2 className="mb-2 font-semibold text-yellow-200">إدارة التحديات</h2>
        <p className="mb-4 text-sm leading-relaxed text-red-300">
          أضف تحدي وانشره. اللاعبين يشوفوا التحدي المنشور تحت فطوطة بعد ما يضغطوا ابدأ.
        </p>
        <Link
          href="/admin/challenges"
          className="inline-flex rounded-lg bg-gradient-to-r from-red-700 to-red-900 px-5 py-2 text-xs font-semibold text-yellow-200 shadow transition hover:from-red-600 hover:to-red-800"
        >
          فتح التحديات
        </Link>
      </GlowCard>

      <GlowCard className="p-5" glow="gold">
        <h2 className="mb-2 font-semibold text-yellow-200">كيف بتشتغل اللعبة؟</h2>
        <ol className="flex list-decimal flex-col gap-2 pr-5 text-sm text-red-300">
          <li>اكتب تحدي جديد (عنوان، وصف، تعليمات، تلميحات).</li>
          <li>اضغط «نشر» على التحدي اللي عايزه يظهر للاعبين.</li>
          <li>اللاعب يضغط ابدأ → فطوطة ترقص والصوت يشتغل مرة → التحدي يظهر تحتها.</li>
        </ol>
      </GlowCard>
    </div>
  );
}
