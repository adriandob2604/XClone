import { useContext, useEffect, useState } from "react";
import { letters, UserData } from "../utils";
import axios from "axios";
import { KeycloakContext } from "../keycloakprovider";

export default function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [singleUser, setSingleUser] = useState<UserData | null>(null);
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    if (keycloak.hasRealmRole("admin") && isAuthenticated) {
      axios
        .get("/users", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setUsers(response.data))
        .catch((err) => console.error(err));
    }
  }, [keycloak.token, isAuthenticated, selectedLetter]);

  useEffect(() => {
    if (keycloak.hasRealmRole("admin") && isAuthenticated) {
      axios.get(`/users/${userInput}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
    }
  }, []);

  return (
    <>
      <nav>
        <input type="text" placeholder="Search for users" />
        <button
          type="button"
          onFocus={() => setSearchClicked((previous: boolean) => !previous)}
        >
          Search
        </button>
      </nav>
      <main>
        {searchClicked && singleUser && (
          <>
            <nav>
              {/* <Image></Image> */}
              <div>
                {singleUser.name} {singleUser.surname}
              </div>
              <div>@{singleUser.username}</div>
              <div>{singleUser.createdOn.getDate()}</div>
            </nav>
          </>
        )}
        <div>
          {letters.map((letter: string) => (
            <button key={letter} onClick={() => setSelectedLetter(letter)}>
              {letter}
            </button>
          ))}
        </div>
        {selectedLetter && users.length > 0 && (
          <div>
            {users.map((user: UserData) => (
              <div key={user.id}>
                {/* <Image></Image> */}
                <div>
                  {user.name} {user.surname}
                </div>
                <div>@{user.username}</div>
                <button>Delete User</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
