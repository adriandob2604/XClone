"use client";
import { usePathname } from "next/navigation";
import { LeftSideBar } from "@/app/home/home";
// import WhoToFollow from "@/app/components/whoToFollow";
import Trending from "@/app/components/trending";
import Searchbar from "../search/searchbar";
import { KeycloakProvider } from "@/app/keycloakprovider";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHome = !["/login", "/signup"].includes(pathname);
  const showWhoToFollow = ![
    "/login",
    "/signup",
    "/messages",
    "/settings",
  ].includes(pathname);
  const showTrending = ![
    "/login",
    "/signup",
    "/explore",
    "/messages",
    "/settings",
  ].includes(pathname);
  const showSearchBar = !["/messages", "/search"].includes(pathname);
  const isHomePage = pathname === "/";
  return (
    // <KeycloakProvider>
    <main className="root-container">
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
    // </KeycloakProvider>
  );
}
