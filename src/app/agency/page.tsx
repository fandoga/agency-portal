import { connection } from "next/server";
import AgencyPageLoader from "./AgencyPageLoader";

export const dynamic = "force-dynamic";

export default async function AgencyRoute() {
  await connection();
  return <AgencyPageLoader />;
}
