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
  useEffect(() => {
    if (token) {
      axios
        .get(`${url}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
          setIsOwn(response.data.username === pathname);
        });
    } else {
      axios.get(`${url}/users/${pathname}`).then((response) => {
        setUserData(response.data);
        setIsOwn(false);
      });
    }
  }, [token, pathname]);
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
                <Link href={`/${userData.username}`}>Posts</Link>
                <Link href={`/${userData.username}/with_replies`}>Replies</Link>
                <Link href={`/${userData.username}/highlights`}>
                  Highlights
                </Link>
                <Link href={`/${userData.username}/articles`}>Articles</Link>
                <Link href={`/${userData.username}/media`}>Media</Link>
                <Link href={`/${userData.username}/likes`}>Likes</Link>
              </footer>
            </nav>
            <main>
              <GetPosts url={`${url}/${userData.username}/posts`} />
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
