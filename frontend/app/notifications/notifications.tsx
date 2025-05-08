"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
export default function Notifications() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const notifs = localStorage.getItem("notifications");
    if (notifs) {
      setNotifications(JSON.parse(notifs));
    }
  }, [notifications]);
  return (
    <>
      <header>
        <nav>
          <h4>Notifications</h4>
          <Link href={`/settings/${pathname}`}>Settings</Link>
        </nav>
        <nav>
          <Link href={`${pathname}/`}>All</Link>
          <Link href={`${pathname}/verified`}>Verified</Link>
          <Link href={`${pathname}/mentions`}>Mentions</Link>
        </nav>
      </header>
      <main>
        <div>
          {notifications.length === 0 && (
            <>
              <h3>Nothing to see here - yet</h3>
              <p>
                From likes to reposts and a whole lot more, this is where all
                the action happens.
              </p>
            </>
          )}
          {notifications.length !== 0 && (
            <>
              {notifications.map((notification) => {
                <div>{notification}</div>;
              })}
            </>
          )}
        </div>
      </main>
    </>
  );
}
