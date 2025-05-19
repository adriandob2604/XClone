"use client";
import { socket } from "@/app/components/socket";
import { useEffect, useState } from "react";
import { Chat } from "../utils";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function Messages() {
  const url = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    axios
      .get(`${url}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setChats(response.data))
      .catch((err) => console.error(err));
  }, []);
  const goToChat = (id: string) => {
    router.push(``);
  };
  return (
    <main>
      {chats.length > 0 && (
        <>
          {chats.map((chat: Chat) => (
            <div key={`${chat.user.id}`} onClick={() => goToChat(chat.id)}>
              {/* <Image></Image> */}
              <div>
                <span>
                  {chat.user.name} {chat.user.surname}
                </span>
                <span>@{chat.user.username}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
