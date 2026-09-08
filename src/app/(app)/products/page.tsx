import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { toPlainData } from "@/lib/firestore/serialize";
import { ProductListTable } from "@/components/products/ProductListTable";
import type { CuttingSchedule, Product, StockPlace } from "../../../../types";

export default async function ProductsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const db = getAdminDb();
  const [
    productsSnap,
    usersSnap,
    suppliersSnap,
    userDocSnap,
    schedulesSnap,
    stockPlacesSnap,
  ] = await Promise.all([
    db.collection("products").get(),
    db.collection("users").get(),
    db.collection("suppliers").get(),
    db.collection("users").doc(user.uid).get(),
    db.collection("cuttingSchedules").get(),
    db.collection("stockPlaces").orderBy("kana").get(),
  ]);

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string]),
  );

  const suppliersMap: Record<string, string> = Object.fromEntries(
    suppliersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string]),
  );

  const cuttingSchedulesMap: Record<string, CuttingSchedule> =
    Object.fromEntries(
      schedulesSnap.docs.map((d) => [
        d.id,
        {
          ...(toPlainData(d.data()) as Record<string, unknown>),
          id: d.id,
        } as CuttingSchedule,
      ]),
    );

  const stockPlaces: StockPlace[] = stockPlacesSnap.docs.map((d) => ({
    ...(toPlainData(d.data()) as Omit<StockPlace, "id">),
    id: d.id,
  }));

  const userData = userDocSnap.data();
  const isAdmin = Boolean(userData?.admin);
  const isRD = Boolean(userData?.rd || userData?.admin);

  const products = productsSnap.docs
    .filter((d) => !d.data().deletedAt)
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>;
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw;
      return { ...data, id: d.id } as Omit<Product, "createdAt" | "updatedAt">;
    })
    .sort((a, b) => (a.productNumber < b.productNumber ? -1 : 1));

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-370 mx-auto pt-6">
        <ProductListTable
          products={products}
          usersMap={usersMap}
          suppliersMap={suppliersMap}
          cuttingSchedulesMap={cuttingSchedulesMap}
          stockPlaces={stockPlaces}
          userId={user.uid}
          isAdmin={isAdmin}
          isRD={isRD}
        />
      </div>
    </div>
  );
}
