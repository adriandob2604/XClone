"use client";
import { UserData, url } from "@/app/utils";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Followers() {
  const [followers, setFollowers] = useState<UserData[]>([]);
  const pathname = usePathname();
  const username = pathname.split("/")[1];
  useEffect(() => {
    axios.get(`${url}/interactions/${username}/followers`);
  });
  return <></>;
}
