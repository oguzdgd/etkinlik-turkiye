import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { createEvent } from "../services/eventsService";
import { uploadEventImage } from "../services/storageService";
import { eventKeys } from "../queryKeys";

// Two-step mutation: upload image (optional) → insert row.
// lat/lng come directly from the LocationPicker in the form.
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: async ({ imageFile, ...values }) => {
      if (!uid) throw new Error("Etkinlik oluşturmak için giriş yapmalısınız.");
      const imageURL = imageFile ? await uploadEventImage(imageFile, uid) : null;
      return createEvent({ uid, ...values, imageURL });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.pending() });
    },
  });
}
