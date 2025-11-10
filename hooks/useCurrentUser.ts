"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  userId: string;
  orgId: string;
  name?: string;
}

const ORG_KEY = "current-org-id";
const USER_KEY = "current-user-id";

export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({ userId: "", orgId: "" });

  useEffect(() => {
    const ensure = () => {
      let orgId = localStorage.getItem(ORG_KEY) || "org-alpha"; // default mock org
      let userId = localStorage.getItem(USER_KEY);
      if (!userId) {
        userId = `user-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(USER_KEY, userId);
      }
      setState({ userId, orgId });
    };
    ensure();
    const onStorage = () => ensure();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return state;
}

export function setOrgId(orgId: string) {
  localStorage.setItem(ORG_KEY, orgId);
  window.dispatchEvent(new StorageEvent("storage", { key: ORG_KEY }));
}
