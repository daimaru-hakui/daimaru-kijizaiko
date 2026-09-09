import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { SupplierInputArea } from "@/components/settings/suppliers/SupplierInputArea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import type { Supplier } from "../../../../../../types";

const EMPTY_SUPPLIER: Supplier = { id: "", name: "", kana: "", comment: "" };

export default async function SupplierNewPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  // 同名の仕入先を二重登録しないよう、登録済みの名前を渡す
  const snap = await getAdminDb().collection("suppliers").get();
  const existingNames = snap.docs.map((d) => (d.data().name ?? "") as string);

  return (
    <PageContainer maxWidth="max-w-xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">仕入先登録</h2>
          <Link href="/settings/suppliers">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">戻る</Button>
          </Link>
        </div>
        <SupplierInputArea type="new" supplier={EMPTY_SUPPLIER} existingNames={existingNames} />
      </div>
    </PageContainer>
  );
}
