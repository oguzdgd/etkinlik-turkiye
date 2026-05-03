import { useMutation } from "@tanstack/react-query";
import { signInWithEmail } from "../services/authService";

export function useLogin() {
  return useMutation({
    mutationFn: signInWithEmail,
  });
}
