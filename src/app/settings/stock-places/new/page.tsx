import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { StockPlaceInputArea } from "@/components/settings/stock-places/StockPlaceInputArea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { StockPlace } from "../../../../../types";

const EMPTY_STOCK_PLACE: StockPlace = {
  id: "", name: "", kana: "", address: "", tel: "", fax: "", comment: "",
};

export default async function StockPlaceNewPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-lg mx-auto my-6 p-6 rounded-md bg-white shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">送り先登録</h2>
          <Link href="/settings/stock-places">
            <Button size="sm" variant="outline">戻る</Button>
          </Link>
        </div>
        <StockPlaceInputArea type="new" stockPlace={EMPTY_STOCK_PLACE} />
      </div>
    </div>
  );
}
