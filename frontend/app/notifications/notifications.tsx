"use client";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Notification, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import Image from "next/image";
export default function Notifications() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);

  useEffect(() => {
    if (isAuthenticated && !loading && keycloak.token) {
      axios
        .get(`${url}/notifications`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setNotifications(response.data))
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated, loading, keycloak.token]);
  return (
    <main className="notifications-container">
      <header>
        <nav className="notifications-navigation">
          <h3>Notifications</h3>
          <button className="clear-notifications-button">
            Clear Notifications
          </button>
        </nav>
        <nav className="all-notifications-container">
          <Link href={`${pathname}/`}>All</Link>
        </nav>
      </header>
      <div>
        {notifications.length === 0 && (
          <div className="no-notifications-container">
            <h3>Nothing to see here - yet</h3>
            <p>
              From likes to reposts and a whole lot more, this is where all the
              action happens.
            </p>
          </div>
        )}
        {notifications.length !== 0 && (
          <>
            {notifications.map((notification) => {
              <div key={notification.id} className="notification-element">
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <div>{notification.notification}</div>;
              </div>;
            })}
          </>
        )}
      </div>
    </main>
  );
}
