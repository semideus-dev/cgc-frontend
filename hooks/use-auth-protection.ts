"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface UseAuthProtectionOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuthProtection(options: UseAuthProtectionOptions = {}) {
  const { redirectTo = "/sign-in", requireAuth = true } = options;
  const { data: session, isPending: isLoading } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    if (requireAuth && !session?.user) {
      // User is not authenticated but auth is required
      router.push(redirectTo);
    } else if (!requireAuth && session?.user) {
      // User is authenticated but shouldn't be (e.g., on auth pages)
      router.push("/dashboard");
    }
  }, [session, isLoading, requireAuth, redirectTo, router]);

  return {
    session,
    isLoading,
    isAuthenticated: !!session?.user,
  };
}