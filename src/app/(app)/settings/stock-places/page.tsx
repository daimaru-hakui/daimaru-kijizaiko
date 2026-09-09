import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getStockPlacesPageData } from "@/lib/settings/queries";
import { StockPlacesTable } from "./_components/StockPlacesTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export default async function StockPlacesPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const { stockPlaces } = await getStockPlacesPageData();

  return (
    <PageContainer maxWidth="max-w-6xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">送り先一覧</h2>
          <Link href="/settings/stock-places/new">
            <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">新規登録</Button>
          </Link>
        </div>
        <StockPlacesTable stockPlaces={stockPlaces} />
      </div>
    </PageContainer>
  );
}
