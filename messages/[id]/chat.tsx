// import { KeycloakContext } from "@/app/keycloakprovider";
// import { UserData, Message, url } from "@/app/utils";
// import axios from "axios";
// import { usePathname } from "next/navigation";
// import { useRouter } from "next/navigation";
// import { useContext, useEffect, useState } from "react";

// export const { io } = require("socket.io-client");

// export default function Chat() {
//   const pathname = usePathname();

//   const socket = io(url);
//   const chatId = pathname.split("/")[1];
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [messagedUser, setMessagedUser] = useState<UserData | null>(null);
//   const router = useRouter();
//   const { keycloak, isAuthenticated } = useContext(KeycloakContext);
//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/login");
//     }
//   }, [isAuthenticated]);
//   if (!isAuthenticated) {
//     return <p>Not authenticated!</p>;
//   }
//   useEffect(() => {
//     axios
//       .get(`${url}/chats/${chatId}`, {
//         headers: {
//           Authorization: `Bearer ${keycloak.token}`,
//         },
//       })
//       .then((response) => {
//         setMessages(response.data.messages);
//         setMessagedUser(response.data.user);
//       })
//       .catch((err) => console.error(err));
//   }, [chatId]);
//   return (
//     <aside>
//       <nav>
//         {/* <Image></Image> */}
//         <div>{messagedUser?.username}</div>
//       </nav>
//       <main>
//         {messages.map((message: Message) => (
//           <div key={message.id}>
//             <div>{message.message}</div>
//             <p>{message.createdOn.getTime()}</p>
//           </div>
//         ))}
//       </main>
//       <footer>
//         <input type="text" />
//         <input type="text" placeholder="Write a message" />
//         <button></button>
//       </footer>
//     </aside>
//   );
// }
