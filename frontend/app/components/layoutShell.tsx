"use client";
import { usePathname } from "next/navigation";
import { LeftSideBar } from "@/app/home/home";
// import WhoToFollow from "@/app/components/whoToFollow";
import Trending from "@/app/components/trending";
import Searchbar from "../search/searchbar";
import { useContext, useEffect, useLayoutEffect } from "react";
import { KeycloakContext } from "../keycloakprovider";
import { useRouter } from "next/navigation";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useContext(KeycloakContext);
  const pathname = usePathname();
  const showHome = pathname !== "/signup";
  const showWhoToFollow = !["/signup", "/messages", "/settings"].includes(
    pathname
  );
  const showTrending = ![
    "/signup",
    "/explore",
    "/messages",
    "/settings",
  ].includes(pathname);
  const showSearchBar = !["/messages", "/search"].includes(pathname);
  const isHomePage = pathname === "/";
  const publicRoutes = ["/signup", "/"];
  useLayoutEffect(() => {
    if (!loading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push("/");
    }
  }, [isAuthenticated, pathname, loading]);

  return (
    <main>
      <section>{!isHomePage && showHome && <LeftSideBar />}</section>
      <nav>
        {!isHomePage && showSearchBar && pathname === "/explore" && (
          <Searchbar />
        )}
      </nav>
      <aside>
        {!isHomePage &&
          showSearchBar &&
          pathname !== "/explore" &&
          showHome && <Searchbar />}
        {/* {!isHomePage && showWhoToFollow && <WhoToFollow />} */}
        {!isHomePage && showTrending && <Trending />}
      </aside>
      <div>{children}</div>
    </main>
  );
}
