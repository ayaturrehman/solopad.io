import { redirect } from "next/navigation";

export default async function SettingsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const nextParams = new URLSearchParams();

  if (typeof params.billing === "string" && params.billing.length > 0) {
    nextParams.set("billing", params.billing);
  }

  const query = nextParams.toString();
  redirect(query ? `/settings/billing?${query}` : "/settings/billing");
}
