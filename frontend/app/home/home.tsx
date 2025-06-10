"use client";
import { JSX, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { CreatePost, GetPosts } from "../[user]/status/[postId]/post";
import { UserData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import Image from "next/image";
export function LeftSideBar(): JSX.Element {
  const [moreClicked, setMoreClicked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileClicked, setProfileClicked] = useState<boolean>(false);
  const { keycloak, logout } = useContext(KeycloakContext);
  const handleLogout = () => {
    logout({
      redirectUri: `${window.location.origin}`,
    });
  };
  useEffect(() => {
    if (!keycloak.token) return;
    try {
      axios
        .get(`${url}/users/me`, {
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
  }, [keycloak.token]);
  if (isLoading) {
    return <p>Loading...</p>;
  }
  return (
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
        {/* <div className="section-element">
            <Image alt="messages" src="/" />
            <Link href="/messages">Messages</Link>
          </div> */}
        <div className="section-element">
          {/* <Image alt="profile" src="/" /> */}
          <Link href={`/${userData?.username}`}>Profile</Link>
        </div>
        <div className="section-element">
          {keycloak.hasRealmRole("admin") && (
            <div className="section-element">
              <Link href={"/admin"}>Admin Panel</Link>
            </div>
          )}
        </div>
        {/* <div className="section-element">
          <Image alt="settings" src="/" />
          <button onClick={() => setMoreClicked((previous) => !previous)}>
            More
          </button>
          {moreClicked && (
            <Link href="/settings/account">Settings and privacy</Link>
          )}
        </div> */}
      </div>
      <div className="section-post">
        <Link href={"/compose/post"}>Post</Link>
      </div>
      {userData && (
        <div className="section-profile">
          {userData.profileImageUrl && (
            <Image
              alt="profile-pic"
              src={`${userData.profileImageUrl}`}
              width={32}
              height={32}
            />
          )}
          {!userData.profileImageUrl && (
            <Image
              alt="default-profile-pic"
              src="/pfp.jpg"
              width={32}
              height={32}
            />
          )}

          <div
            onClick={() => setProfileClicked(true)}
            onBlur={() => setProfileClicked(false)}
            role="button"
            tabIndex={0}
            className="username-section"
          >
            <div>
              {userData?.name} {userData?.surname}
            </div>
            <p>@{userData?.username}</p>
          </div>
          <div>
            <strong>...</strong>
          </div>
          <div>
            <button onClick={handleLogout}>Log out @{userData.username}</button>
          </div>
          {/* <Image alt="spread" src="/" /> */}
        </div>
      )}
    </section>
  );
}
export function HomeMainPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  return (
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
      {activeTab === "forYou" && (
        <GetPosts url={`${url}/posts/for_you_posts`} />
      )}
      {activeTab === "following" && (
        <GetPosts url={`${url}/posts/following_posts`} />
      )}
    </>
  );
}
