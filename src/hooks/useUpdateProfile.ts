import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventTemplate } from "nostr-tools";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { finishEvent } from "~/lib/nostr/finishEvent";
import { parseUint8Array } from "~/lib/nostr/parseUint8Array";
import { publish } from "~/lib/nostr/publish";

interface ProfileData {
  name?: string;
  about?: string;
  picture?: string;
  website?: string;
  location?: string;
  github?: string;
  twitter?: string;
  nip05?: string;
  lud16?: string;
  [key: string]: unknown;
}

interface UpdateProfileParams {
  profileData: ProfileData;
  existingProfile?: any;
  secretKey?: string;
}

export const useUpdateProfile = (publicKey: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileData,
      existingProfile,
      secretKey,
    }: UpdateProfileParams) => {
      // Merge new profile data with existing data to preserve unknown fields
      const mergedContent = {
        ...(existingProfile?.event?.content
          ? JSON.parse(existingProfile.event.content)
          : {}),
        ...profileData,
      };

      // Remove undefined values
      Object.keys(mergedContent).forEach((key) => {
        if (mergedContent[key] === undefined || mergedContent[key] === "") {
          delete mergedContent[key];
        }
      });

      const eventTemplate: EventTemplate = {
        kind: 0, // Nostr profile metadata
        tags: [],
        content: JSON.stringify(mergedContent),
        created_at: Math.floor(Date.now() / 1000),
      };

      let secretKeyBytes: Uint8Array<ArrayBufferLike> | undefined;
      if (secretKey && secretKey !== "0") {
        secretKeyBytes = parseUint8Array(secretKey);
        if (!secretKeyBytes) {
          throw new Error("Invalid secret key");
        }
      }

      const event = await finishEvent(eventTemplate, secretKeyBytes);
      if (!event) {
        throw new Error("Failed to sign event");
      }

      const published = await publish(event, DEFAULT_RELAYS);
      if (!published) {
        throw new Error("Failed to publish profile update");
      }

      return event;
    },
    onSuccess: () => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile", publicKey] });
    },
  });
};
