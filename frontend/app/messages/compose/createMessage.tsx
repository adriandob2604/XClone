"use client";
import { KeycloakContext } from "@/app/keycloakprovider";
import { UserData, url } from "@/app/utils";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
export default function CreateMessage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const router = useRouter();
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);
  if (!isAuthenticated) {
    return <p>Not authenticated!</p>;
  }
  useEffect(() => {
    axios
      .get(`${url}/users`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUsers(response.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);
  const messageForm = useFormik({
    initialValues: {
      text: "",
      user: {
        id: "",
        name: "",
        surname: "",
        username: "",
        createdOn: new Date(),
      },
    },
    validationSchema: Yup.object({
      text: Yup.string().min(1).required("Required"),
      user: Yup.object({
        id: Yup.string().required(),
        name: Yup.string().required(),
        surname: Yup.string().required(),
        username: Yup.string().required(),
        createdOn: Yup.date().required(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          `${url}/chats`,
          { text: values.text, userId: values.user.id },
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );
        if (response.status === 201) {
          router.push(`/messages/${response.data.chatId}`);
        }
      } catch (err) {
        console.error(err);
      }
    },
  });

  function handleUserChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const val = event.target.value;
    setInputValue(val);
    const filteredUsers = users.filter(
      (user: UserData) =>
        user.name.toLowerCase().startsWith(val.toLowerCase()) ||
        user.surname.toLowerCase().startsWith(val.toLowerCase()) ||
        user.username.toLowerCase().startsWith(val.toLowerCase())
    );
    if (val) {
      setFilteredUsers(filteredUsers);
    } else {
      setFilteredUsers([]);
    }
  }
  if (isLoading) {
    return <p>loading...</p>;
  }
  return (
    <form onSubmit={messageForm.handleSubmit}>
      <nav>
        <button>x</button>
        <h3>New message</h3>
        <button
          type="submit"
          disabled={messageForm.values.text !== "" ? false : true}
        >
          Next
        </button>
      </nav>
      <main>
        {/* <Image></Image> */}
        <input
          type="text"
          placeholder="Search people"
          value={inputValue}
          onChange={handleUserChange}
          disabled={selectedUser !== null ? true : false}
        />
        {selectedUser && (
          <>
            <div>
              {/* <Image></Image> */}
              <div>{selectedUser.username}</div>
              <button onClick={() => setSelectedUser(null)}>x</button>
            </div>
            <input
              type="text"
              placeholder="Write a message"
              {...messageForm.getFieldProps("text")}
            />
          </>
        )}
        <div>
          {filteredUsers.map((user: UserData) => (
            <div
              key={`${user.id}-${user.username}`}
              onClick={() => setSelectedUser(user)}
            >
              {/* <Image></Image> */}
              <div>
                {user.name} {user.surname}
              </div>
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      </main>
    </form>
  );
}
