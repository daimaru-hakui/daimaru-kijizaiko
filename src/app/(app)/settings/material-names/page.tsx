import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { PageContainer } from "@/components/ui/page-container";
import { MaterialNamesClient } from "./_components/MaterialNamesClient";

export default async function MaterialNamesPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("components").doc("materialNames").get();
  const names: string[] = snap.data()?.data ?? [];

  return (
    <PageContainer maxWidth="max-w-xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <MaterialNamesClient initialNames={names} />
      </div>
    </PageContainer>
  );
}
