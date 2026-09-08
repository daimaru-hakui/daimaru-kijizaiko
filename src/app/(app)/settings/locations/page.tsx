import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseDocs } from "@/lib/firestore/parse";
import { locationSchema } from "@/lib/firestore/schemas";
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
  const locations = parseDocs(snap.docs, locationSchema, "locations");

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">徳島保管場所一覧</h2>
            <Link href="/settings/locations/new">
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">新規登録</Button>
            </Link>
          </div>
          <LocationsTable locations={locations} />
        </div>
      </div>
    </div>
  );
}
