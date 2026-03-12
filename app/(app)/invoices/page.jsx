
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  redirect("/finance?tab=invoices");
}
