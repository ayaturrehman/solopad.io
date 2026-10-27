import ComparisonPage from "@/components/marketing/ComparisonPage";
import { comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("plutio-alternative");

export default function Page() {
  return <ComparisonPage slug="plutio-alternative" />;
}
