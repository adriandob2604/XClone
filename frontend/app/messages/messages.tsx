"use client";
import { useEffect, useState } from "react";
import { Chat } from "../utils";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
export default function Messages() {
  const url = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname);
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
      {chats.length === 0 && (
        <div>
          <h2>Welcome to your inbox!</h2>
          <p>
            Drop a line, share posts and more with private conversations between
            you and others on X.
          </p>
          <Link href={`${pathname}/compose`}>Write a message</Link>
        </div>
      )}
    </main>
  );
}
