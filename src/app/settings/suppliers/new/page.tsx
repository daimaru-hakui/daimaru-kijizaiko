import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { SupplierInputArea } from "@/components/settings/suppliers/SupplierInputArea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Supplier } from "../../../../../types";

const EMPTY_SUPPLIER: Supplier = { id: "", name: "", kana: "", comment: "" };

export default async function SupplierNewPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">仕入先登録</h2>
            <Link href="/settings/suppliers">
              <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">戻る</Button>
            </Link>
          </div>
          <SupplierInputArea type="new" supplier={EMPTY_SUPPLIER} />
        </div>
      </div>
    </div>
  );
}
