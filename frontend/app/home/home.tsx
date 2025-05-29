"use client";
import { JSX, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { CreatePost, GetPosts } from "../[user]/status/[postId]/post";
import { UserData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
export function LeftSideBar(): JSX.Element {
  const [moreClicked, setMoreClicked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileClicked, setProfileClicked] = useState<boolean>(false);
  const keycloak = useContext(KeycloakContext);
  useEffect(() => {
    try {
      axios
        .get(`${url}/me`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setUserData(response.data));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  if (isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <section className="section-container">
        <div className="section-routes">
          <div className="section-element">
            {/* <Image alt="Home" src="/" /> */}
            <Link href="/home">Home</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="explore" src="/" /> */}
            <Link href="/explore">Explore</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="notifications" src="/" /> */}
            <Link href="/notifications">Notifications</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="messages" src="/" /> */}
            <Link href="/messages">Messages</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="profile" src="/" /> */}
            <Link href={`/${userData?.username}`}>Profile</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="settings" src="/" /> */}
            <button onClick={() => setMoreClicked((previous) => !previous)}>
              More
            </button>
            {moreClicked && (
              <Link href="/settings/account">Settings and privacy</Link>
            )}
          </div>
        </div>
        <div className="section-post">
          <Link href={"/compose/post"}>Post</Link>
        </div>
        {userData && (
          <div className="section-profile">
            {/* <Image alt="profile-pic" src="/" /> */}
            <div
              onClick={() => setProfileClicked(true)}
              onBlur={() => setProfileClicked(false)}
              role="button"
              tabIndex={0}
            >
              <h4>
                {userData?.name} {userData?.surname}
              </h4>
              <p>@{userData?.username}</p>
            </div>
            {profileClicked && (
              <div>
                <button>Log out @{userData.username}</button>
              </div>
            )}
            {/* <Image alt="spread" src="/" /> */}
          </div>
        )}
      </section>
    </>
  );
}
export function HomeMainPage() {
  const url = "http://localhost:5000";
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  return (
    <>
      <>
        <nav>
          <div>
            <button onClick={() => setActiveTab("forYou")}>For you</button>
            <button onClick={() => setActiveTab("following")}>Following</button>
          </div>
          <div>
            <CreatePost />
          </div>
        </nav>
        {activeTab === "forYou" && <GetPosts url={`${url}/for_you_posts`} />}
        {activeTab === "following" && (
          <GetPosts url={`${url}/following_posts`} />
        )}
      </>
    </>
  );
}
