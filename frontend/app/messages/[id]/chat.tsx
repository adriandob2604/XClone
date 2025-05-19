import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Chat() {
  const pathname = usePathname();
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000";
  const chatId = pathname.split("/")[1];
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    axios
      .get(`${url}/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setMessages(response.data))
      .catch((err) => console.error(err));
  }, [chatId]);
  return (
    <>
      <nav></nav>
    </>
  );
}
