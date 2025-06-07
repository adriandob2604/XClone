"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { TrendingData, UserData, url } from "../utils";
import { FollowUser } from "../components/whoToFollow";
import { KeycloakContext } from "../keycloakprovider";
export default function Explore() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    if (!loading && isAuthenticated) {
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

  if (isLoading) {
    return <p>loading...</p>;
  }
  return (
    <>
      <nav>
        <Link href={`/settings/${pathname}`}>Settings</Link>
      </nav>
      <main>
        <div>
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
        </div>
        <FollowUser users={usersToFollow} />
      </main>
    </>
  );
}
