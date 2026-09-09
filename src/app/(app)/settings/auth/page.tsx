import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseDocs } from "@/lib/firestore/parse";
import { userSchema } from "@/lib/firestore/schemas";
import { PageContainer } from "@/components/ui/page-container";
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
    <PageContainer maxWidth="max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">権限管理</h2>
        </div>
        <AuthTable users={users} />
      </div>
    </PageContainer>
  );
}
