"use client";
import axios from "axios";
import { JSX, useEffect, useState } from "react";
import Link from "next/link";
import { UserData, PostData } from "../utils";
import { usePathname } from "next/navigation";
import { GetPosts } from "./status/[postId]/post";

export default function Profile() {
  const url = "http://localhost:5000";
  const [userData, setUserData] = useState<UserData | null>(null);
  const pathname = usePathname().slice(1);
  const [isOwn, setIsOwn] = useState<boolean>(false);
  const [postCount, setPostCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const pathUsername = pathname.replace("/", "");
    const isOwn = pathUsername === username;
    const customHeaders = isOwn ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`${url}/users/${pathname}`, {
        headers: customHeaders,
      })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [pathname, username, token]);
  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <>
        {userData && (
          <>
            <header>
              <Link href="/home">Back</Link>

              <div>
                {userData?.name} {userData?.surname}
              </div>
              <p>{postCount} posts</p>
            </header>
            <nav>
              <div>
                <div>
                  <div>
                    {/* <div>{userData?.image}</div> */}
                    {isOwn && (
                      <Link href={"/settings/profile"}>Edit profile</Link>
                    )}
                    {!isOwn && (
                      <>
                        <button>More</button>
                        <Link href={"/explore"}>Search</Link>
                        <button></button>
                      </>
                    )}
                  </div>
                  <div>
                    <strong>
                      {userData?.name} {userData?.surname}
                    </strong>
                  </div>
                  <p>@{userData?.username}</p>
                  <p>
                    Joined {new Date(userData.createdOn).toLocaleDateString()}
                  </p>
                  <div>
                    <p>Following</p>
                    <p>Followers</p>
                  </div>
                </div>
              </div>
              <footer>
                <Link href={`/${username}`}>Posts</Link>
                <Link href={`/${username}/with_replies`}>Replies</Link>
                <Link href={`/${username}/highlights`}>Highlights</Link>
                <Link href={`/${username}/articles`}>Articles</Link>
                <Link href={`/${username}/media`}>Media</Link>
                <Link href={`/${username}/likes`}>Likes</Link>
              </footer>
            </nav>
            <main>
              <GetPosts />
            </main>
            <footer>
              <header>Who to follow</header>
            </footer>
          </>
        )}
        {!userData && (
          <>
            <header>
              <Link href={"/home"}>Back</Link>
              <h4>Profile</h4>
            </header>
            <main>
              <nav>Background</nav>
              {/* <Image></Image> */}
              <div>
                <strong>@{pathname.toString()}</strong>
              </div>
            </main>
            <footer>
              <h2>This account doesn't exist</h2>
              <p>Try searching for another.</p>
            </footer>
          </>
        )}
      </>
    );
  }
}
