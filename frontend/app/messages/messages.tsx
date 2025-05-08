"use client";
import { socket } from "@/app/components/socket";
import { useEffect, useState } from "react";
export default function Messages() {
  const [connected, setConnected] = useState<boolean>(false);
  // useEffect(() => {
  //     if (socket.connected){
  //         onConnect()
  //     }
  //     function onConnect() {
  //         setConnected(true)

  //     }
  // },[])
  return (
    <>
      <header></header>
    </>
  );
}
