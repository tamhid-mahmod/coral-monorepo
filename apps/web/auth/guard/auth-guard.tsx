"use client";

import { useState, useEffect } from "react";

import { paths } from "@/routes/paths";
import { useRouter, usePathname } from "@/routes/hooks";

import { useAuthContext } from "../hooks";

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const createRedirectPath = (currentPath: string) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  };

  const checkPermissions = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const redirectPath = createRedirectPath(paths.auth.signIn);

      router.replace(redirectPath);

      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  // if (isChecking) {
  //   return <p>redirecting....</p>;
  // }

  return <>{children}</>;
}
