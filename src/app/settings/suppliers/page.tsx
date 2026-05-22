import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Supplier } from "../../../../types";
import { SuppliersTable } from "./_components/SuppliersTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SuppliersPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("suppliers").get();
  // @ts-expect-error TODO(phase5): Firestore DocumentData → Supplier 型変換
  const suppliers: Supplier[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">仕入先一覧</h2>
            <Link href="/settings/suppliers/new">
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">新規登録</Button>
            </Link>
          </div>
          <SuppliersTable suppliers={suppliers} />
        </div>
      </div>
    </div>
  );
}
