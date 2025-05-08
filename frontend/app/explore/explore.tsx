"use client";
import { usePathname } from "next/navigation";
import Searchbar from "../search/searchbar";
import Link from "next/link";
import WhoToFollow from "../components/whoToFollow";
import Home from "../home/home";
export default function Explore() {
  const pathname = usePathname();
  return (
    <>
      <header>
        <div>
          <Searchbar />
          <Link href={`/settings/${pathname}`}>Settings</Link>
        </div>
      </header>
      <nav>
        <Link href={`${pathname}/for_you`}>For you</Link>
        <Link href={`${pathname}/trending`}>Trending</Link>
        <Link href={`${pathname}/news`}>News</Link>
        <Link href={`${pathname}/sports`}>Sports</Link>
        <Link href={`${pathname}/entertainment`}>Entertainment</Link>
      </nav>
      <aside>
        <WhoToFollow />
      </aside>
      <main>
        <div>
          <h3>Today's News</h3>
          {/* TODO NEWS */}
        </div>
        <div>{/* TODO TRENDING */}</div>
        <div>
          <h3>Business news</h3>
          {/* TODO BUSINESS */}
        </div>
        <div>
          <h3>Posts For You</h3>
          {/* MAP POSTS RECOMMENDED */}
        </div>
      </main>
    </>
  );
}
