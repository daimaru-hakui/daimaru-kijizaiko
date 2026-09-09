import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getLocationNewPageData } from "@/lib/settings/queries";
import { LocationInputArea } from "@/components/settings/locations/LocationInputArea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import type { Location } from "../../../../../../types";

export default async function LocationNewPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const { existingNames, nextOrder } = await getLocationNewPageData();

  const emptyLocation: Location = { id: "", name: "", order: nextOrder, comment: "" };

  return (
    <PageContainer maxWidth="max-w-xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">徳島保管場所登録</h2>
          <Link href="/settings/locations">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">戻る</Button>
          </Link>
        </div>
        <LocationInputArea type="new" location={emptyLocation} existingNames={existingNames} />
      </div>
    </PageContainer>
  );
}
