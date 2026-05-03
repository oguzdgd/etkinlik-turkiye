import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { createEvent } from "../services/eventsService";
import { uploadEventImage } from "../services/storageService";
import { geocodeAddress } from "../lib/geocode";
import { eventKeys } from "../queryKeys";
import { EVENT_TYPE } from "@lib/constants";

// Three-step mutation: geocode (in_person only) → upload image → insert row.
// Geocoding failure is non-fatal: the event is saved without coordinates and
// simply won't appear on the map.
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: async ({ imageFile, ...values }) => {
      if (!uid) throw new Error("Etkinlik oluşturmak için giriş yapmalısınız.");

      const imageURL = imageFile ? await uploadEventImage(imageFile, uid) : null;

      let lat = null;
      let lng = null;
      if (values.type === EVENT_TYPE.IN_PERSON) {
        const coords = await geocodeAddress({
          city: values.city,
          locationText: values.locationText,
        });
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      return createEvent({ uid, ...values, imageURL, lat, lng });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.pending() });
    },
  });
}
