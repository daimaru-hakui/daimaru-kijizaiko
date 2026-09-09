import { redirect } from "next/navigation";
import { verifyServerSession } from "@/lib/auth/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export default async function SettingsPage() {
  const user = await verifyServerSession();
  if (!user) redirect("/login");

  const links = [
    { href: "/settings/auth", label: "権限の追加・編集" },
    { href: "/settings/suppliers", label: "仕入先の追加・編集" },
    { href: "/settings/stock-places", label: "送り先の追加・編集" },
    { href: "/settings/colors", label: "色の追加・編集" },
    { href: "/settings/material-names", label: "組織名の追加・編集" },
    { href: "/settings/locations", label: "徳島保管場所の追加・編集" },
  ];

  return (
    <PageContainer maxWidth="max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-1 items-center justify-start">
          {links.map((link) => (
            <div key={link.href} className="w-full">
              <Link href={link.href}>
                <Button variant="outline" className="w-full">{link.label}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
