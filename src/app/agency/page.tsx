import { connection } from "next/server";
import AgencyPage from "@/src/page/agency/AgencyPage";

export const dynamic = "force-dynamic";

export default async function Agency() {
  await connection();
  return <AgencyPage />;
}
