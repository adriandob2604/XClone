"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { TrendingData, UserData, url } from "../utils";
import { FollowUser } from "../components/whoToFollow";
import { KeycloakContext } from "../keycloakprovider";
import Searchbar from "../search/searchbar";
export default function Explore() {
  const [usersToFollow, setUsersToFollow] = useState<UserData[]>([]);
  const [trending, setTrending] = useState<TrendingData[]>([]);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const router = useRouter();
  const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);

  const handleTrendingPosts = (tag: string) => {
    params.set("q", tag);
    router.push(`/search?${params.toString()}`);
  };
  useEffect(() => {
    if (!loading && isAuthenticated && keycloak.token) {
      const headers = {
        Authorization: `Bearer ${keycloak.token}`,
      };

      Promise.all([
        axios.get(`${url}/tags`, { headers }),
        axios.get(`${url}/users/to_follow`, { headers }),
      ])
        .then(([tagsResponse, toFollowResponse]) => {
          if (tagsResponse.status === 200 && tagsResponse.data) {
            setTrending(tagsResponse.data);
          }
          if (toFollowResponse.status === 200 && toFollowResponse.data) {
            setUsersToFollow(toFollowResponse.data);
          }
        })
        .catch((err) => console.error("error", err));
    }
  }, [loading, isAuthenticated]);
  return (
    <>
      <main>
        <Searchbar />
        {trending.length !== 0 && (
          <>
            {trending.map((news: TrendingData) => (
              <div key={news.tag}>
                <p>Trending</p>
                <button
                  type="button"
                  onClick={() => handleTrendingPosts(news.tag)}
                >
                  {news.tag}
                </button>
                <p>{news.posts.length} posts</p>
              </div>
            ))}
          </>
        )}
        {trending.length === 0 && <p>No trending posts!</p>}
        <FollowUser users={usersToFollow} />
      </main>
    </>
  );
}
