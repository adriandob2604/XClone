"use client";
import axios from "axios";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/router";

type UserData = {
  username: string;
  name: string;
  surname: string;
  password: string;
  email: string;
  phoneNumber: string;
  createdOn: Date;
};

export default function Profile(): JSX.Element {
  const url = "localhost:5000";
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");
    try {
      axios
        .get(`${url}/${username}`, {
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
  if (userData) {
    setIsLoading(false);
  }
  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <nav>
          <button>Home</button>
          <div>
            <div></div>
            <p></p>
          </div>
        </nav>
      </>
    );
  }
}
