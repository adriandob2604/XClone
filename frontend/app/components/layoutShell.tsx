"use client";
import { usePathname } from "next/navigation";
import { LeftSideBar } from "@/app/home/home";
import { WhoToFollow } from "@/app/components/whoToFollow";
import Trending from "@/app/components/trending";
import Searchbar from "../search/searchbar";
import { useContext, useEffect } from "react";
import { KeycloakContext } from "../keycloakprovider";
import { useRouter } from "next/navigation";
import { HomeMainPage } from "@/app/home/home";
import Explore from "../explore/explore";
import Notifications from "../notifications/notifications";
import axios from "axios";
import { url } from "@/app/utils";
import Profile from "../profile/[user]/profile";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useContext(KeycloakContext);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated]);
  const pathname = usePathname();
  const showHome = !["/signup", "/compose"].includes(pathname);
  const showWhoToFollow = ![
    "/signup",
    "/messages",
    "/settings",
    "/compose",
  ].includes(pathname);
  const showTrending = ![
    "/compose",
    "/signup",
    "/explore",
    "/messages",
    "/settings",
  ].includes(pathname);
  const showSearchBar = !["/messages", "/search"].includes(pathname);
  const isHomePage = pathname === "/";
  const publicRoutes = !["/signup", "/"].includes(pathname);
  useEffect(() => {
    if (!loading && !isAuthenticated && publicRoutes) {
      router.push("/");
    }
  }, [isAuthenticated, pathname, loading]);
  return (
    <main className="main-container">
      <section>{!isHomePage && showHome && <LeftSideBar />}</section>
      <main className="main-page">
        {publicRoutes &&
          pathname !== "/explore" &&
          pathname !== "/notifications" &&
          !pathname.includes("/profile") && <HomeMainPage />}
        {pathname === "/explore" && <Explore />}
        {pathname === "/notifications" && <Notifications />}
        {pathname.includes("/profile") && <Profile />}
      </main>
      <aside className="aside-container">
        {!isHomePage &&
          showSearchBar &&
          pathname !== "/explore" &&
          showHome && <Searchbar />}
        {!isHomePage && showWhoToFollow && <WhoToFollow />}
        {!isHomePage && showTrending && <Trending />}
      </aside>
      <div>{children}</div>
    </main>
  );
}
