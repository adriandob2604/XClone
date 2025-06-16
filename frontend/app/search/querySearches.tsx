"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { PostData, UserData, url } from "../utils";
import { FollowUser } from "../components/whoToFollow";
import { PostComponent } from "../profile/[user]/status/[postId]/post";
import { KeycloakContext } from "../keycloakprovider";

export default function QuerySearches() {
  const searchparams = useSearchParams();
  const params = new URLSearchParams(searchparams.toString());
  const searchQuery = params.get("q");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [postData, setPostData] = useState<PostData[]>([]);
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
    <div className="query-searches-container">
      {userData.length !== 0 && (
        <div className="query-searches-people">
          <h2>People</h2>
          <FollowUser users={userData} />
        </div>
      )}
      <div className="query-searches-posts">
        {postData.length !== 0 && (
          <div>
            <h2>Posts</h2>
            <PostComponent postData={postData} />
          </div>
        )}
      </div>
    </div>
  );
}
