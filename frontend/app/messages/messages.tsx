// "use client";
// import { useContext, useEffect, useState } from "react";
// import { Chat, url } from "../utils";
// import axios from "axios";
// import { usePathname, useRouter } from "next/navigation";
// import Link from "next/link";
// import { KeycloakContext } from "../keycloakprovider";
// export default function Messages() {
//   const pathname = usePathname();
//   const [chats, setChats] = useState<Chat[]>([]);
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
//       .get(`${url}/chats`, {
//         headers: {
//           Authorization: `Bearer ${keycloak.token}`,
//         },
//       })
//       .then((response) => setChats(response.data))
//       .catch((err) => console.error(err));
//   }, []);
//   const goToChat = (id: string) => {
//     router.push(``);
//   };
//   return (
//     <main>
//       {chats.length > 0 && (
//         <>
//           {chats.map((chat: Chat) => (
//             <div key={`${chat.user.id}`} onClick={() => goToChat(chat.id)}>
//               {/* <Image></Image> */}
//               <div>
//                 <span>
//                   {chat.user.name} {chat.user.surname}
//                 </span>
//                 <span>@{chat.user.username}</span>
//               </div>
//             </div>
//           ))}
//         </>
//       )}
//       {chats.length === 0 && (
//         <div>
//           <h2>Welcome to your inbox!</h2>
//           <p>
//             Drop a line, share posts and more with private conversations between
//             you and others on X.
//           </p>
//           <Link href={`${pathname}/compose`}>Write a message</Link>
//         </div>
//       )}
//     </main>
//   );
// }
