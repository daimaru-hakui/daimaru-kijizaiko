import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { toPlainData } from "@/lib/firestore/serialize";
import { withId } from "@/lib/firestore/with-id";
import { buildUsersMap } from "@/lib/users/map";
import { ProductListTable } from "@/components/products/ProductListTable";
import { PageContainer } from "@/components/ui/page-container";
import type { CuttingSchedule, SerializableProduct, StockPlace } from "../../../../types";

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
    locationsSnap,
    grayFabricsSnap,
  ] = await Promise.all([
    db.collection("products").get(),
    db.collection("users").get(),
    db.collection("suppliers").get(),
    db.collection("users").doc(user.uid).get(),
    db.collection("cuttingSchedules").get(),
    db.collection("stockPlaces").orderBy("kana").get(),
    db.collection("locations").get(),
    db.collection("grayFabrics").get(),
  ]);

  const usersMap = buildUsersMap(usersSnap.docs);

  const suppliersMap = buildUsersMap(suppliersSnap.docs);

  const locationsMap = buildUsersMap(locationsSnap.docs);

  const grayFabricsMap: Record<
    string,
    { productNumber: string; productName: string }
  > = Object.fromEntries(
    grayFabricsSnap.docs.map((d) => [
      d.id,
      {
        productNumber: (d.data().productNumber ?? "") as string,
        productName: (d.data().productName ?? "") as string,
      },
    ]),
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
    .map((d) => withId<SerializableProduct>(d))
    .sort((a, b) => (a.productNumber < b.productNumber ? -1 : 1));

  return (
    <PageContainer maxWidth="max-w-370">
      <ProductListTable
        products={products}
        usersMap={usersMap}
        suppliersMap={suppliersMap}
        locationsMap={locationsMap}
        grayFabricsMap={grayFabricsMap}
        cuttingSchedulesMap={cuttingSchedulesMap}
        stockPlaces={stockPlaces}
        userId={user.uid}
        isAdmin={isAdmin}
        isRD={isRD}
      />
    </PageContainer>
  );
}
