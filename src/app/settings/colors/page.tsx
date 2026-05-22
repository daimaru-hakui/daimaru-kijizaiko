import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { ColorsClient } from "./_components/ColorsClient";

export default async function ColorsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("components").doc("colors").get();
  const colors: string[] = snap.data()?.data ?? [];

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-md mx-auto my-6 p-6 rounded-md bg-white shadow-md">
        <ColorsClient initialColors={colors} />
      </div>
    </div>
  );
}
