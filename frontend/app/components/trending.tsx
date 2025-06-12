"use client";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { TrendingData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
export default function Trending() {
  const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);
  const [trending, setTrending] = useState<TrendingData[]>([]);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const router = useRouter();
  useEffect(() => {
    if (!loading && isAuthenticated) {
      axios
        .get(`${url}/tags`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          setTrending(response.data);
        });
    }
  }, [loading, isAuthenticated]);
  const handleTagClick = (tag: string) => {
    params.set("q", tag);
    router.push(`/search?${params.toString()}`);
  };
  return (
    <div className="trending-container">
      <h2>What's happening</h2>
      {trending.length > 0 && (
        <div>
          {trending.map((tag: TrendingData) => (
            <div key={tag.tag} className="trending-tag">
              <div>
                <p>Trending</p>
                <div onClick={() => handleTagClick(tag.tag)}>
                  <strong>{tag.tag}</strong>
                </div>
              </div>
              <p>...</p>
              <p>{tag.posts.length} posts</p>
            </div>
          ))}
        </div>
      )}
      {trending.length === 0 && <p>No trending posts!</p>}
    </div>
  );
}
