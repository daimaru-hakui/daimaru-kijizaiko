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
    <div className="w-full mt-12 px-6">
      <div className="max-w-md mx-auto my-6 p-6 rounded-md bg-white shadow-md">
        <MaterialNamesClient initialNames={names} />
      </div>
    </div>
  );
}
