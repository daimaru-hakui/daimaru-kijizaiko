import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { withId } from "@/lib/firestore/with-id";
import { buildUsersMap } from "@/lib/users/map";
import { AdjustmentProductTable } from "@/components/adjustment/AdjustmentProductTable";
import { PageContainer } from "@/components/ui/page-container";
import type { Product } from "../../../../../types";

export default async function AdjustmentProductsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const db = getAdminDb();
  const [productsSnap, userDoc, usersSnap] = await Promise.all([
    db.collection("products").orderBy("productNumber").get(),
    db.collection("users").doc(user.uid).get(),
    db.collection("users").get(),
  ]);

  const userData = userDoc.data();
  const isRD = Boolean(userData?.rd || userData?.admin);
  const isTokushima = Boolean(userData?.tokushima || userData?.admin);

  const usersMap = buildUsersMap(usersSnap.docs);

  const products = productsSnap.docs
    // 論理削除された生地は在庫調整の対象外
    .filter((d) => !d.data().deletedAt)
    .map((d) => withId<Product>(d));

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
