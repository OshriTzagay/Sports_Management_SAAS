import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="text-primary-500 size-9" />
    </div>
  );
}
