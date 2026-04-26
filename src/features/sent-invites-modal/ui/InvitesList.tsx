import { Invite } from "@/src/entities/members/lib/types";
import InviteItem from "./InviteItem";

interface InvitesListProps {
  invites: Invite[];
  onCopyLink: (token: string) => void;
  onDeleteInvite: (id: string) => void;
  isDeleting: boolean;
}

const InvitesList = ({
  invites,
  onCopyLink,
  onDeleteInvite,
  isDeleting,
}: InvitesListProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {invites.map((invite) => (
        <InviteItem
          key={invite.id}
          invite={invite}
          onCopyLink={onCopyLink}
          onDelete={onDeleteInvite}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

export default InvitesList;
