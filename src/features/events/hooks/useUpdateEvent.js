import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { updateEvent } from "../services/eventsService";
import { uploadEventImage } from "../services/storageService";
import { geocodeAddress } from "../lib/geocode";
import { eventKeys } from "../queryKeys";
import { EVENT_TYPE } from "@lib/constants";

// Geocode → upload new image (if any) → update row + reset to pending.
// existingLat/existingLng are kept as fallback if geocoding fails.
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: async ({ eventId, existingLat, existingLng, existingImageURL, imageFile, ...values }) => {
      if (!uid) throw new Error("Düzenleme için giriş yapmalısınız.");

      const imageURL = imageFile
        ? await uploadEventImage(imageFile, uid)
        : existingImageURL ?? null;

      let lat = existingLat ?? null;
      let lng = existingLng ?? null;

      if (values.type === EVENT_TYPE.IN_PERSON || values.type === EVENT_TYPE.HYBRID) {
        const coords = await geocodeAddress({ city: values.city, locationText: values.locationText });
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      } else {
        lat = null;
        lng = null;
      }

      await updateEvent(eventId, { uid, ...values, imageURL, lat, lng });
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
