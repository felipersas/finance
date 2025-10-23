import { trpc } from "@/utils/server"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const useUploadCsvMutation = () => {
  return useMutation(trpc.csv.upload.mutationOptions({
    onSuccess: ({ message }) => {
      toast.success(message);
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  }))
}
