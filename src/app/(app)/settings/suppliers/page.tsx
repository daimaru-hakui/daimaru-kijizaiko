import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseDocs } from "@/lib/firestore/parse";
import { supplierSchema } from "@/lib/firestore/schemas";
import { sortByKana } from "@/lib/sort";
import { SuppliersTable } from "./_components/SuppliersTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SuppliersPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("suppliers").get();
  // Firestore の orderBy("kana") はカナ未登録のドキュメントを取りこぼすため JS 側で並べる
  const suppliers = sortByKana(parseDocs(snap.docs, supplierSchema, "suppliers"));

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
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
