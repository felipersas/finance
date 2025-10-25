import { useTRPC } from "@/utils/trpc/trpc-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUploadCsvMutation = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.csv.upload.mutationOptions({
      onSuccess: ({ message }) => {
        toast.success(message);
      },
      onError: ({ message }) => {
        toast.error(message);
      },
    }),
  );
};
