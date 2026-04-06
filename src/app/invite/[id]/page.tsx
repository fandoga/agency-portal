import InvitePage from "@/src/page/invites/InvitePage";
import { notFound } from "next/navigation";

export default async function Invite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <InvitePage token={id} />;
}
