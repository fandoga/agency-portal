import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface ProfileBadgeProps
  extends React.ComponentPropsWithoutRef<"div"> {
  logo: string;
  name: string;
  hasDrodown?: boolean;
  dropdownRotate?: boolean;
}

const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  logo,
  name,
  hasDrodown = true,
  dropdownRotate = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-full px-4 w-full h-18 border-1 shadow-sm flex items-center justify-between gap-6",
        className,
      )}
      {...props}
    >
      <Avatar className="" size="lg">
        {logo && logo.startsWith("http") && (
          <AvatarImage src={logo} alt="@profile" />
        )}
        <AvatarFallback>PR</AvatarFallback>
      </Avatar>
      <h2 className="text-xl">{name}</h2>
      {
        <ChevronDown
          className={`pt-1 transition-all ${!hasDrodown && "opacity-0"} ${dropdownRotate && "rotate-180"}`}
        />
      }
    </div>
  );
};

export default ProfileBadge;
