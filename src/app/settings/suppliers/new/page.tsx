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
    <div className="w-full mt-12 px-6">
      <div className="max-w-lg mx-auto my-6 p-6 rounded-md bg-white shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">仕入先登録</h2>
          <Link href="/settings/suppliers">
            <Button size="sm" variant="outline">戻る</Button>
          </Link>
        </div>
        <SupplierInputArea type="new" supplier={EMPTY_SUPPLIER} />
      </div>
    </div>
  );
}
