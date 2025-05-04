"use client";
import axios from "axios";
import { JSX, useEffect, useState } from "react";
import Link from "next/link";

type UserData = {
  username: string;
  name: string;
  surname: string;
  password: string;
  email: string;
  phoneNumber: string;
  createdOn: Date;
  birthDate: Date;
  image?: File;
  backgroundImage?: File;
};
type PostData = {
  user: UserData;
  createdOn: Date;
  text: string;
  image?: File;
  video?: File;
};

export default function Profile(): JSX.Element {
  const url = "http://localhost:5000";
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostData | null>(null);
  const username = JSON.parse(localStorage.getItem("username") || "");
  const token = JSON.parse(localStorage.getItem("token") || "");

  useEffect(() => {
    try {
      axios
        .get(`${url}/users/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserData(response.data);
        });
    } catch (err) {
      console.error("Error while loading user data", err);
    }
  }, []);
  return (
    <>
      <header>
        <Link href="/home">Back</Link>
        <div>
          {userData?.name} {userData?.surname}
        </div>
        <p>{0} posts</p>
      </header>
      <main>
        <div>
          <div>
            <div>
              {/* <div>{userData?.image}</div> */}
              <Link href={"/settings/profile"}>Edit profile</Link>
            </div>
            <div>
              <strong>
                {userData?.name} {userData?.surname}
              </strong>
            </div>
            <p>@{userData?.username}</p>
            <p>Joined {String(userData?.createdOn).split("T")[0]}</p>
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
      </main>
      <footer>
        <header>Who to follow</header>
      </footer>
    </>
  );
}
