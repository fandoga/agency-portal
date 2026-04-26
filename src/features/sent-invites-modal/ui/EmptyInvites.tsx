import { Mail } from "lucide-react";

const EmptyInvites = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Mail className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Нет отправленных приглашений
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Приглашения, которые вы отправите, появятся здесь
      </p>
    </div>
  );
};

export default EmptyInvites;
