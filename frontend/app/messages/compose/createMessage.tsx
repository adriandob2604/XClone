import { UserData } from "@/app/utils";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CreateMessage() {
  const url = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserData[]>([]);
  useEffect(() => {
    axios
      .get(`${url}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUsers(response.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  });
  if (isLoading) {
    return <p>loading...</p>;
  }
  return (
    <>
      <nav>
        <button>x</button>
        <h3>New message</h3>
        <button>Next</button>
      </nav>
      <main>
        {/* <Image></Image> */}
        <input type="text" placeholder="Search people" />
      </main>
    </>
  );
}
