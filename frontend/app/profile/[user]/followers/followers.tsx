"use client";
import { KeycloakContext } from "@/app/keycloakprovider";
import { UserData, url } from "@/app/utils";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Followers() {
  const [followers, setFollowers] = useState<UserData[]>([]);
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const pathname = usePathname();
  const username = pathname.split("/")[1];
  useEffect(() => {
    if (keycloak.token && isAuthenticated) {
      axios
        .get(`${url}/interactions/${username}/followers`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setFollowers(response.data.followers))
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated, keycloak.token]);
  return <></>;
}
