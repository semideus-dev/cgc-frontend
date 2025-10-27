"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

interface UserStats {
  totalCanvases: number;
  totalProjects: number;
  memberSince: string;
  lastLogin: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  stats: UserStats;
}

async function fetchUserData(): Promise<UserData | null> {
  try {
    const response = await fetch("/api/user/profile");
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export function useUserData() {
  const { data: session } = authClient.useSession();
  
  return useQuery({
    queryKey: ["user-data", session?.user?.id],
    queryFn: fetchUserData,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}