"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingData, UserData } from "../utils";
import { FollowUser } from "../components/whoToFollow";
import { useRouter } from "next/navigation";
export default function Explore() {
  const pathname = usePathname();
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usersToFollow, setUsersToFollow] = useState<UserData[]>([]);
  const [trending, SetTrending] = useState<TrendingData[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const handleTrendingPosts = (tag: string) => {
    params.set("q", tag);
    router.push(`/search?${params.toString()}`);
  };
  useEffect(() => {
    axios
      .get(`${url}/trending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200 && response.data) {
          SetTrending(response.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    axios
      .get(`${url}/to_follow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUsersToFollow(response.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);
  if (isLoading) {
    return <p>loading...</p>;
  }
  console.log(trending);
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
