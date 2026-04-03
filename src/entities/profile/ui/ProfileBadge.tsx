import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";

interface ProfileBadgeType {
  logo: string;
  name: string;
  hasDrodown?: boolean;
}

const ProfileBadge: React.FC<ProfileBadgeType> = ({
  logo,
  name,
  hasDrodown = true,
}) => {
  return (
    <div className="rounded-full px-4 w-full h-18 border-1 shadow-sm flex items-center justify-between gap-6">
      <Avatar className="" size="lg">
        {logo.startsWith("http") && <AvatarImage src={logo} alt="@profile" />}
        <AvatarFallback>PR</AvatarFallback>
      </Avatar>
      <h2 className="text-xl">{name}</h2>
      {<ChevronDown className={`pt-1 ${!hasDrodown && "opacity-0"}`} />}
    </div>
  );
};

export default ProfileBadge;
