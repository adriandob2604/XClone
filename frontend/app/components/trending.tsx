"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { TrendingData } from "../utils";
import Link from "next/link";
export default function Trending() {
  const url = "http://localhost:5000";
  const [trending, setTrending] = useState<TrendingData[]>([]);
  useEffect(() => {
    axios.get(`${url}/trending`).then((response) => {
      setTrending(response.data);
    });
  }, []);
  return (
    <>
      <h2>What's happening</h2>
      {/* TODO MAP TRENDING */}
      <Link href={"/explore/tabs/for-you"}>Show more</Link>
    </>
  );
}
