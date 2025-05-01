"use client";
import axios from "axios";
import { JSX, useEffect, useState } from "react";
import Link from "next/link";

type UserData = {
  image: string;
  username: string;
  name: string;
  surname: string;
  password: string;
  email: string;
  phoneNumber: string;
  createdOn: Date;
  birthDate: Date;
};
type PostData = {
  user: UserData;
  createdOn: Date;
  text: string;
  image?: string;
  video?: string;
};

export default function Profile(): JSX.Element {
  const url = "http://localhost:5000";
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostData | null>(null);

  useEffect(() => {
    const username = JSON.parse(localStorage.getItem("username") || "");
    const token = JSON.parse(localStorage.getItem("token") || "");
    console.log(username);
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
            <div>{userData?.image}</div>
            <div>
              <strong>
                {userData?.name} {userData?.surname}
              </strong>
            </div>
            <p>@{userData?.username}</p>
            <p>Joined {String(userData?.createdOn).split("T")[0]}</p>
          </div>
        </div>
      </main>
    </>
  );
}
