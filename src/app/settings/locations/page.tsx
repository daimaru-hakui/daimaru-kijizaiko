import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Location } from "../../../../types";
import { LocationsTable } from "./_components/LocationsTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LocationsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb()
    .collection("locations")
    .orderBy("order", "asc")
    .get();
  // @ts-expect-error TODO(phase5): Firestore DocumentData → Location 型変換
  const locations: Location[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-lg mx-auto my-6 rounded-md bg-white shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">徳島保管場所一覧</h2>
            <Link href="/settings/locations/new">
              <Button size="sm">新規登録</Button>
            </Link>
          </div>
          <div className="mt-6">
            <LocationsTable locations={locations} />
          </div>
        </div>
      </div>
    </div>
  );
}
