import { useEffect, useState } from "react";
import { fcl } from "@/lib/flow";

export type FlowUser = {
  addr?: string | null;
  loggedIn?: boolean | null;
};

export function useFlowUser() {
  const [user, setUser] = useState<FlowUser>({ loggedIn: null, addr: undefined });

  useEffect(() => {
    return fcl.currentUser.subscribe(setUser);
  }, []);

  const logIn = () => fcl.authenticate();
  const logOut = () => fcl.unauthenticate();

  return { user, logIn, logOut };
}
