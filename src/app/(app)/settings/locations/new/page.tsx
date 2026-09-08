import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { LocationInputArea } from "@/components/settings/locations/LocationInputArea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Location } from "../../../../../../types";

export default async function LocationNewPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("locations").get();
  const nextOrder = snap.size + 1;

  const emptyLocation: Location = { id: "", name: "", order: nextOrder, comment: "" };

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">徳島保管場所登録</h2>
            <Link href="/settings/locations">
              <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">戻る</Button>
            </Link>
          </div>
          <LocationInputArea type="new" location={emptyLocation} />
        </div>
      </div>
    </div>
  );
}
