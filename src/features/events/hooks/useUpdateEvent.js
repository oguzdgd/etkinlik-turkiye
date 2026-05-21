import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { updateEvent } from "../services/eventsService";
import { uploadEventImage } from "../services/storageService";
import { eventKeys } from "../queryKeys";

// Upload new image (if any) → update row + reset to pending.
// lat/lng come directly from the LocationPicker in the form.
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: async ({ eventId, existingImageURL, imageFile, ...values }) => {
      if (!uid) throw new Error("Düzenleme için giriş yapmalısınız.");
      const imageURL = imageFile
        ? await uploadEventImage(imageFile, uid)
        : existingImageURL ?? null;
      await updateEvent(eventId, { uid, ...values, imageURL });
    },

    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.pending() });
      queryClient.invalidateQueries({ queryKey: eventKeys.userEvents(uid) });
      queryClient.invalidateQueries({ queryKey: eventKeys.map() });
    },
  });
}
