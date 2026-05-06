import { useMutation } from "@tanstack/react-query";
import { updatePassword } from "../services/authService";

export function useUpdatePassword() {
  return useMutation({ mutationFn: updatePassword });
}
