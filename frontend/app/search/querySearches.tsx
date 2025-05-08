"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Searchbar from "./searchbar";

export default function QuerySearches() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const params = new URLSearchParams(searchparams.toString());
  const searchQuery = params.get("q") || "";
  const [inputClicked, setInputClicked] = useState<boolean>(false);
  return (
    <>
      <nav>
        <button>Back</button>
        <div>
          {/* <image></image> */}
          <Searchbar />
          <button></button>
          {inputClicked && (
            <>
              <nav>Search for "{searchQuery}"</nav>
              {/* TODO MAP FOUND USERS */}
              <Link href={`/${searchQuery}`}>Go to @{searchQuery}</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
