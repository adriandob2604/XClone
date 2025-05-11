"use client";
import { JSX, useEffect, useState } from "react";
import Link from "next/link";
export function Home(): JSX.Element {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [moreClicked, setMoreClicked] = useState<boolean>(false);
  useEffect(() => {
    const user = localStorage.getItem("username");
    setUsername(user);
    setLoading(false);
  }, []);
  if (loading) {
    return <></>;
  } else {
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
}
export function HomePost() {}
