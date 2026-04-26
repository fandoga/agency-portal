import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Check } from "lucide-react";
import { Invite } from "@/src/entities/members/lib/types";
import { formatDate, roleLabels, statusConfig } from "../lib/utils";
import { useState } from "react";

interface InviteItemProps {
  invite: Invite;
  onCopyLink: (token: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const InviteItem = ({
  invite,
  onCopyLink,
  onDelete,
  isDeleting,
}: InviteItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyLink(invite.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card size="sm" className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{roleLabels[invite.role]}</Badge>
          <Badge
            variant="outline"
            className={statusConfig[invite.status].color}
          >
            {statusConfig[invite.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Создано: {formatDate(invite.created_at)}
          </p>
          <p className="text-muted-foreground font-mono text-xs">
            Token: {invite.token.substring(0, 8)}...
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={copied}
          className="w-full sm:w-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Скопировать ссылку
            </>
          )}
        </Button>
        {invite.status === "pending" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(invite.id)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Отменить
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InviteItem;
