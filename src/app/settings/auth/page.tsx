import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { User } from "../../../../types";
import { AuthTable } from "./_components/AuthTable";

export default async function AuthPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb()
    .collection("users")
    .orderBy("rank", "asc")
    .get();

  // @ts-expect-error TODO(phase5): Firestore DocumentData → User 型変換
  const users: User[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-4xl mx-auto my-6 rounded-md bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">権限管理</h2>
          <AuthTable users={users} />
        </div>
      </div>
    </div>
  );
}
