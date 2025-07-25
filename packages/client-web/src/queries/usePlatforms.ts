import {
  GetPlatformsRequestSchema,
  type GetPlatformsResponse,
} from "@retrom/codegen/retrom/services/platform-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function usePlatforms<S = GetPlatformsResponse>(
  opts: {
    request?: MessageInitShape<typeof GetPlatformsRequestSchema>;
    selectFn?: (data: GetPlatformsResponse) => S;
  } = {},
) {
  const { request = {}, selectFn } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["platforms", "platform-metadata", request, retromClient],
    queryFn: () => retromClient.platformClient.getPlatforms(request),
    select: selectFn,
  });
}
