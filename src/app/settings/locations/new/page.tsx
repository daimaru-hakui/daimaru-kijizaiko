import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { LocationInputArea } from "@/components/settings/locations/LocationInputArea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Location } from "../../../../../types";

export default async function LocationNewPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("locations").get();
  const nextOrder = snap.size + 1;

  const emptyLocation: Location = { id: "", name: "", order: nextOrder, comment: "" };

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-lg mx-auto my-6 p-6 rounded-md bg-white shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">徳島保管場所登録</h2>
          <Link href="/settings/locations">
            <Button size="sm" variant="outline">戻る</Button>
          </Link>
        </div>
        <LocationInputArea type="new" location={emptyLocation} />
      </div>
    </div>
  );
}
