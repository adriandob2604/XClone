"use client";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { TrendingData, url } from "../utils";
import Link from "next/link";
import { KeycloakContext } from "../keycloakprovider";
export default function Trending() {
  const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);
  const [trending, setTrending] = useState<TrendingData[]>([]);
  useEffect(() => {
    if (!loading && isAuthenticated) {
      axios
        .get(`${url}`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          setTrending(response.data);
        });
    }
  }, [loading, isAuthenticated]);
  return (
    <>
      <h2>What's happening</h2>
      {/* TODO MAP TRENDING */}
      <Link href={"/explore/tabs/for-you"}>Show more</Link>
    </>
  );
}
