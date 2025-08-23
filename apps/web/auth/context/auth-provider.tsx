"use client";

import { useMemo, useEffect, useCallback } from "react";

import axios, { endpoints } from "@/lib/axios";

import { useSetState } from "@/hooks/use-set-state";

import { AuthContext } from "./auth-context";
import { setSession } from "./session";

import type { AuthState } from "../types";
import { getSession } from "./session";

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const session = await getSession();

      if (session) {
        const res = await axios.get(endpoints.auth.me);

        const { user } = res.data;

        setState({
          user: {
            ...user,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          },
          loading: false,
        });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? "authenticated" : "unauthenticated";

  const status = state.loading ? "loading" : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? { ...state.user, role: state.user?.role ?? "admin" }
        : null,
      checkUserSession,
      loading: status === "loading",
      authenticated: status === "authenticated",
      unauthenticated: status === "unauthenticated",
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
