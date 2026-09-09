import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getProductsPageData } from "@/lib/products/queries";
import { ProductListTable } from "@/components/products/ProductListTable";
import { PageContainer } from "@/components/ui/page-container";

export default async function ProductsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const data = await getProductsPageData(user.uid);

  return (
    <PageContainer maxWidth="max-w-370">
      <ProductListTable {...data} userId={user.uid} />
    </PageContainer>
  );
}
