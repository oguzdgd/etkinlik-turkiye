import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@services/supabase";
import Spinner from "@components/ui/Spinner";

const initialState = { user: null, role: null, isLoading: true };

const AuthContext = createContext(initialState);

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let profileChannel = null;

    async function applySession(session) {
      // Always tear down any previous profile channel before swapping users.
      profileChannel?.unsubscribe();
      profileChannel = null;

      if (!session?.user) {
        setState({ user: null, role: null, isLoading: false });
        return;
      }

      const authUser = session.user;
      const baseUser = {
        uid: authUser.id,
        email: authUser.email,
        displayName: authUser.user_metadata?.display_name ?? null,
        photoURL: authUser.user_metadata?.avatar_url ?? null,
      };

      // Read role from public.profiles. Auto-created by the on_auth_user_created
      // trigger, but we tolerate a missing row by defaulting to "user".
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle();

      setState({
        user: baseUser,
        role: profile?.role ?? "user",
        isLoading: false,
      });

      // Subscribe to live role changes so admin promotions reach the UI
      // without requiring a re-login. Requires the profiles table to be
      // included in the supabase_realtime publication (see schema.sql).
      profileChannel = supabase
        .channel(`profile:${authUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${authUser.id}`,
          },
          (payload) => {
            setState((prev) =>
              prev.user
                ? { ...prev, role: payload.new.role ?? "user" }
                : prev
            );
          }
        )
        .subscribe();
    }

    // onAuthStateChange fires immediately with the persisted session
    // (INITIAL_SESSION), so a separate getSession() call isn't needed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      subscription.unsubscribe();
      profileChannel?.unsubscribe();
    };
  }, []);

  // Block initial render until first auth resolution to avoid a logged-out flash.
  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
