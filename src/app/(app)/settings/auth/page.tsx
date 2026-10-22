import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import { getAuthPageData } from "@/lib/settings/queries";
import { PageContainer } from "@/components/ui/page-container";
import { AuthTable } from "./_components/AuthTable";

export default async function AuthPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const { users } = await getAuthPageData();

  return (
    <PageContainer maxWidth="max-w-6xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <AuthTable users={users} />
      </div>
    </PageContainer>
  );
}
