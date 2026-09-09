import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { MaterialNamesClient } from "./_components/MaterialNamesClient";

export default async function MaterialNamesPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("components").doc("materialNames").get();
  const names: string[] = snap.data()?.data ?? [];

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <MaterialNamesClient initialNames={names} />
        </div>
      </div>
    </div>
  );
}
