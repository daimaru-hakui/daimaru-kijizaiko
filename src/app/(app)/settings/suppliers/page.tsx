import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getSuppliersPageData } from "@/lib/settings/queries";
import { SuppliersTable } from "./_components/SuppliersTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export default async function SuppliersPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const { suppliers } = await getSuppliersPageData();

  return (
    <PageContainer maxWidth="max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">仕入先一覧</h2>
          <Link href="/settings/suppliers/new">
            <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">新規登録</Button>
          </Link>
        </div>
        <SuppliersTable suppliers={suppliers} />
      </div>
    </PageContainer>
  );
}
