"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Searchbar from "./searchbar";
import axios from "axios";
import { PostData, UserData } from "../utils";

export default function QuerySearches() {
  const url = "http://localhost:5000";
  const searchparams = useSearchParams();
  const params = new URLSearchParams(searchparams.toString());
  const searchQuery = params.get("q");
  const [inputClicked, setInputClicked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [postData, setPostData] = useState<PostData[]>([]);
  const [noResults, setNoResults] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    try {
      axios
        .get(`${url}/explore`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            if (response.data.users) {
              setUserData(response.data.users);
            }
            if (response.data.posts) {
              setPostData(response.data.posts);
            }
          } else {
            setNoResults(response.data.message);
          }
        });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);
  if (isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <nav>
        <div>
          <button>Back</button>
          <Searchbar />
          <button>Options</button>
          {inputClicked && (
            <>
              <nav>Search for "{searchQuery}"</nav>
              {/* TODO MAP FOUND USERS */}
              <Link href={`/${searchQuery}`}>Go to @{searchQuery}</Link>
            </>
          )}
        </div>
        <div>Top</div>
      </nav>
      <main>
        {userData.length === 0 && postData.length === 0 && (
          <>
            <h2>{noResults}</h2>
            <p>Try searching for something else.</p>
          </>
        )}
        {userData.length !== 0 && (
          <>
            {/* <h2>People</h2> */}
            <div>
              <h2>People</h2>
              {userData.map((user: UserData) => (
                <div key={`${user.id}-${user.username}`}>
                  {/* <Image></Image> */}
                  <div>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div>{postData.length !== 0 && <>{/* {postData.map} */}</>}</div>
      </main>
    </>
  );
}
