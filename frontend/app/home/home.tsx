"use client";
import { JSX, useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { CreatePost } from "../profile/[user]/status/[postId]/post";
import { PostData, UserData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import Image from "next/image";
export function LeftSideBar(): JSX.Element {
  const [moreClicked, setMoreClicked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileClicked, setProfileClicked] = useState<boolean>(false);

  const homeRef = useRef<HTMLAnchorElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);
  const notificationsRef = useRef<HTMLAnchorElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);
  const adminRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (ref: React.RefObject<HTMLAnchorElement | null>) => {
    ref.current?.click();
  };
  const { keycloak, logout } = useContext(KeycloakContext);
  const handleLogout = async () => {
    try {
      await axios.delete(`${url}/users/logout`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
        withCredentials: true,
      });

      logout({
        redirectUri: `https://localhost`,
      });
    } catch (error) {
      console.error("Logout error", error);
    }
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
      <h1 className="clone-container">XClone</h1>
      <div className="section-routes">
        <div
          className="section-element"
          onClick={() => handleClick(homeRef)}
          style={{ cursor: "pointer" }}
        >
          <Image alt="home" src="/home.PNG" width={32} height={32} />
          <Link href="/home" ref={homeRef}>
            Home
          </Link>
        </div>
        <div
          className="section-element"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick(exploreRef)}
        >
          <Image alt="explore" src="/explore.PNG" width={32} height={32} />
          <Link href="/explore" ref={exploreRef}>
            Explore
          </Link>
        </div>
        <div
          className="section-element"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick(notificationsRef)}
        >
          <Image
            alt="notifications"
            src="/notifications.PNG"
            width={32}
            height={32}
          />
          <Link href="/notifications" ref={notificationsRef}>
            Notifications
          </Link>
        </div>
        <div
          className="section-element"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick(profileRef)}
        >
          <Image alt="profile" src="/profile.PNG" width={32} height={32} />
          <Link href={`/profile/${userData?.username}`} ref={profileRef}>
            Profile
          </Link>
        </div>
        {keycloak.hasRealmRole("admin") && (
          <div>
            <div
              className="section-element"
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(adminRef)}
            >
              <div className="section-element">
                <Link href={"/admin"} ref={adminRef}>
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="section-post">
          <Link href={"/compose/post"}>Post</Link>
        </div>
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
        </div>
      )}
    </section>
  );
}
export function HomeMainPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [posts, setPosts] = useState<PostData[]>([])
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  useEffect(() => {
    if (keycloak.token && isAuthenticated) {
      axios.get(`${url}/posts/${activeTab}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      }).then((response) => );
    }
  }, [activeTab, keycloak.token, isAuthenticated]);
  return (
    <>
      <nav className="home-navigation">
        <div className="for-you-following-container">
          <button onClick={() => setActiveTab("forYou")}>For you</button>
          <button onClick={() => setActiveTab("following")}>Following</button>
        </div>
        <div>
          <CreatePost />
        </div>
      </nav>
    </>
  );
}
