import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      companyName: true,
      companyLogo: true,
      timezone: true,
      businessId: true,
    },
  });

  if (!user) redirect("/login");

  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
        select: { name: true, logoUrl: true, timezone: true, currency: true },
      })
    : null;

  return (
    <ProfileClient
      profile={{
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "owner",
        companyName: user.companyName ?? "",
        companyLogo: user.companyLogo ?? "",
        timezone: user.timezone ?? "UTC",
      }}
      business={
        business
          ? {
              name: business.name ?? "",
              logoUrl: business.logoUrl ?? "",
              timezone: business.timezone ?? "UTC",
              currency: business.currency ?? "USD",
            }
          : null
      }
    />
  );
}
