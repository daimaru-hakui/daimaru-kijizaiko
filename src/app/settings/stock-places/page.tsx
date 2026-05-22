import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { StockPlace } from "../../../../types";
import { StockPlacesTable } from "./_components/StockPlacesTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StockPlacesPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("stockPlaces").get();
  // @ts-expect-error TODO(phase5): Firestore DocumentData → StockPlace 型変換
  const stockPlaces: StockPlace[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-6xl mx-auto my-6 rounded-md bg-white shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">送り先一覧</h2>
            <Link href="/settings/stock-places/new">
              <Button size="sm">新規登録</Button>
            </Link>
          </div>
          <div className="mt-6">
            <StockPlacesTable stockPlaces={stockPlaces} />
          </div>
        </div>
      </div>
    </div>
  );
}
