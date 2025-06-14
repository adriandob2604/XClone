"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Searchbar from "./searchbar";
import axios from "axios";
import { PostData, UserData, url } from "../utils";
import { FollowUser } from "../components/whoToFollow";
import {
  GetPosts,
  PostComponent,
} from "../profile/[user]/status/[postId]/post";
import { KeycloakContext } from "../keycloakprovider";

export default function QuerySearches() {
  const searchparams = useSearchParams();
  const params = new URLSearchParams(searchparams.toString());
  const searchQuery = params.get("q");
  const [inputClicked, setInputClicked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [postData, setPostData] = useState<PostData[]>([]);
  const [noResults, setNoResults] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);

  useEffect(() => {
    try {
      if (!loading && isAuthenticated) {
        axios
          .get(`${url}/explore`, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, loading, isAuthenticated]);
  if (isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <nav>
        <div>
          <button>Back</button>
          <Searchbar />
        </div>
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
            <h2>People</h2>
            <FollowUser users={userData} />
          </>
        )}
        <div>
          {postData.length !== 0 && (
            <>
              <h2>Posts</h2>
              <PostComponent users={userData} postData={postData} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
