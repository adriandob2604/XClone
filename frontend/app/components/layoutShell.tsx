"use client";
import { usePathname } from "next/navigation";
import { Home } from "@/app/home/home";
import WhoToFollow from "@/app/components/whoToFollow";
import Trending from "@/app/components/trending";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showHome = !["/", "/login", "/signup"].includes(pathname);
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
  const isHomePage = pathname === "/";
  return (
    <>
      <section>{!isHomePage && showHome && <Home />}</section>
      <aside>
        {!isHomePage && showWhoToFollow && <WhoToFollow />}
        {!isHomePage && showTrending && <Trending />}
      </aside>
      <main>{children}</main>
    </>
  );
}
