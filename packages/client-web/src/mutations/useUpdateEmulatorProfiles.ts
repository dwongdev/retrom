import { useToast } from "@retrom/ui/hooks/use-toast";
import { UpdateEmulatorProfilesRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdateEmulatorProfiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof UpdateEmulatorProfilesRequestSchema>,
    ) => retromClient.emulatorClient.updateEmulatorProfiles(request),
    mutationKey: ["update-emulator-profiles", queryClient],
    onError: (error) => {
      console.error(error);
      toast({
        title: "Failed to update emulator profiles",
        description: "Check the console for more information.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Emulator profile(s) updated",
        description: "Emulator profile(s) have been updated successfully.",
      });
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulator-profiles", "emulator-profile"].some((v) =>
            query.queryKey.includes(v),
          ),
      });
    },
  });
}
