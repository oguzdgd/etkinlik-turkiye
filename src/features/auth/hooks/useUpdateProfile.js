import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../services/authService";

export function useUpdateProfile() {
  return useMutation({ mutationFn: updateProfile });
}
