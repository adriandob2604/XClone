"use client";
import { UserData } from "@/app/utils";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Followers() {
  const url = "http://localhost:5000";
  const [followers, setFollowers] = useState<UserData[]>([]);
  const pathname = usePathname();
  const username = pathname.split("/")[1];
  useEffect(() => {
    axios.get(`${url}/${username}/followers`);
  });
  return <>Skibdii</>;
}
