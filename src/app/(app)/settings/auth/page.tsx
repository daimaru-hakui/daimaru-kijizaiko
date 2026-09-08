import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseDocs } from "@/lib/firestore/parse";
import { userSchema } from "@/lib/firestore/schemas";
import { AuthTable } from "./_components/AuthTable";

export default async function AuthPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb()
    .collection("users")
    .orderBy("rank", "asc")
    .get();

  const users = parseDocs(snap.docs, userSchema, "users");

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">権限管理</h2>
          </div>
          <AuthTable users={users} />
        </div>
      </div>
    </div>
  );
}
