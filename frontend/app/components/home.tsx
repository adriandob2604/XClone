"use client";
import { JSX, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PostComponent from "./post";
export default function Home(): JSX.Element {
  const [postClicked, setPostClicked] = useState<boolean>(false);
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
            <Link href="/profile">Profile</Link>
          </div>
          <div className="section-element">
            {/* <Image alt="settings" src="/" /> */}
            <Link href="/settings">Settings</Link>
          </div>
        </div>
        <button
          className="section-post"
          onClick={() => setPostClicked((previous: boolean) => !previous)}
        >
          Post
        </button>

        <div className="section-profile">
          {/* <Image alt="profile-pic" src="/" /> */}
          <div>
            <h4></h4>
            <div></div>
          </div>
          {/* <Image alt="spread" src="/" /> */}
        </div>
      </section>
      {postClicked && (
        <PostComponent
          postClicked={postClicked}
          setPostClicked={setPostClicked}
        />
      )}
    </>
  );
}
