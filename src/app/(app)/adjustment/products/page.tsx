import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdjustmentProductsData } from "@/lib/adjustment/queries";
import { AdjustmentProductTable } from "@/components/adjustment/AdjustmentProductTable";
import { PageContainer } from "@/components/ui/page-container";

export default async function AdjustmentProductsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const { products, usersMap, isRD, isTokushima } = await getAdjustmentProductsData(user.uid);

  return (
    <PageContainer maxWidth="max-w-8xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <AdjustmentProductTable
          products={products}
          usersMap={usersMap}
          isRD={isRD}
          isTokushima={isTokushima}
        />
      </div>
    </PageContainer>
  );
}
