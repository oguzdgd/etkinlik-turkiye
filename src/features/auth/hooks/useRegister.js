import { useMutation } from "@tanstack/react-query";
import { signUpWithEmail } from "../services/authService";

export function useRegister() {
  return useMutation({
    mutationFn: signUpWithEmail,
  });
}
