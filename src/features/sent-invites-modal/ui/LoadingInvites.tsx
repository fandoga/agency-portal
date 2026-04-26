import { Spinner } from "@/components/ui/spinner";

const LoadingInvites = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner className="scale-150" />
    </div>
  );
};

export default LoadingInvites;
