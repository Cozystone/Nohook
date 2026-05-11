import { Dashboard } from "@/components/dashboard";
import { cities } from "@/lib/data";

export default function Home() {
  return <Dashboard cities={cities} />;
}
