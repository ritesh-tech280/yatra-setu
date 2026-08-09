"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getYatraRole } from "@/lib/firebase/firestoreService";
import type { YatraRole, YatraRoleInfo } from "@/types/yatra";

/**
 * Hook to dynamically resolve the current user's role for a specific Yatra.
 * 
 * Logic:
 * 1. Get current authenticated user UID.
 * 2. If no user: role = "no_access".
 * 3. If currentUser.uid === yatra.organizerId -> role = "organizer".
 * 4. Else if yatras/{yatraId}/staff/{currentUser.uid} exists with role=="sahayak" & status=="active" -> role = "sahayak".
 * 5. Else: role = "no_access".
 */
export function useYatraRole(yatraId?: string, yatraOrganizerId?: string): YatraRoleInfo {
  const { user } = useAuth();
  const [role, setRole] = useState<YatraRole>("no_access");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    if (!user || !yatraId) {
      setRole("no_access");
      setLoading(false);
      return;
    }

    // Instant local check if yatraOrganizerId is passed
    const currentUid = user.uid || user.id;
    if (yatraOrganizerId && yatraOrganizerId === currentUid) {
      setRole("organizer");
      setLoading(false);
      return;
    }

    setLoading(true);
    getYatraRole(yatraId, currentUid)
      .then((resolvedRole) => {
        if (isMounted) {
          setRole(resolvedRole);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("useYatraRole error:", err);
        if (isMounted) {
          setRole("no_access");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user, yatraId, yatraOrganizerId]);

  return {
    role,
    isOrganizer: role === "organizer",
    isSahayak: role === "sahayak",
    hasAccess: role === "organizer" || role === "sahayak",
    loading,
  };
}
