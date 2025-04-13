"use client";
import axios from "axios";
import { JSX, useEffect, useState } from "react";
import Image from "next/image";

export default function Profile(): JSX.Element {
  const url = "localhost:5000";
  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  useEffect(() => {
    if (sessionStorage.getItem("username")) {
      const username = sessionStorage.getItem("username") || "";
      setUsername(username);
      axios
        .get(`${url}/${username}`)
        .then((response) => setUserData(response.data))
        .catch((error) => console.error(error))
        .finally(() => setIsLoading(false));
    }
  }, []);
  useEffect(() => {
    if (username) {
      axios
        .get(`${url}/${username}/posts`)
        .then((response) => setPosts(response.data))
        .catch((error) => console.error(error));
    }
  });
  if (!isLoading) {
    return (
      <>
        <nav className="profile-navbar">
          <Image></Image>
          <div>
            <h4>
              {userData.name} {userData.surname}
            </h4>
            <div>{posts.count}</div>
            <div></div>
          </div>
        </nav>
        
      </>
    );
  } else {
    return <>Loading...</>;
  }
}
