"use client";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Notification } from "../utils";
export default function Notifications() {
  const pathname = usePathname();
  const url = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    axios
      .get(`${url}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setNotifications(response.data));
  }, [token]);
  return (
    <>
      <header>
        <nav>
          <h4>Notifications</h4>
          <Link href={`/settings/${pathname}`}>Settings</Link>
        </nav>
        <nav>
          <Link href={`${pathname}/`}>All</Link>
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
                <div key={notification.id}>
                  <div>{notification.notification}</div>;
                </div>;
              })}
            </>
          )}
        </div>
      </main>
    </>
  );
}
