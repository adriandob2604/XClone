"use client";
import { JSX, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Searchbar from "../search/searchbar";
import { PostData } from "../utils";
import { GetPosts } from "../[user]/status/[postId]/post";
export function LeftSideBar(): JSX.Element {
  const url = "http://localhost:5000";
  const [moreClicked, setMoreClicked] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      axios
        .get(`${url}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => setUsername(response.data.username))
        .catch((err) => console.error(err));
    }
  }, [token]);
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
            {/* <Image alt="lists" src="/" /> */}
            <Link href="/lists">Lists</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="bookmarks" src="/" /> */}
            <Link href="/bookmarks">Bookmarks</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="communities" src="/" /> */}
            <Link href="/communities">Communities</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="profile" src="/" /> */}
            <Link href={`/${username}`}>Profile</Link>
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

        <div className="section-profile">
          {/* <Image alt="profile-pic" src="/" /> */}
          <div>
            <h4></h4>
            <div></div>
          </div>
          {/* <Image alt="spread" src="/" /> */}
        </div>
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
          <button onClick={() => setActiveTab("forYou")}>For you</button>
          <button onClick={() => setActiveTab("following")}>Following</button>
        </nav>
        {activeTab === "forYou" && <GetPosts url={`${url}/for_you_posts`} />}
        {activeTab === "following" && (
          <GetPosts url={`${url}/following_posts`} />
        )}
      </>
    </>
  );
}
