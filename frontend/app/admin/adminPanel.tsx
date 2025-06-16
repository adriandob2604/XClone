"use client";
import { useContext, useEffect, useState } from "react";
import { letters, UserData, url } from "../utils";
import axios from "axios";
import { KeycloakContext } from "../keycloakprovider";
import { UserComponent } from "../components/userComponent";

export default function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [singleUser, setSingleUser] = useState<UserData | null>(null);
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [userDeleted, setUserDeleted] = useState<boolean[]>([]);

  useEffect(() => {
    if (keycloak.hasRealmRole("admin") && keycloak.token && isAuthenticated) {
      axios
        .get(`${url}/users`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          setUsers(response.data);
          setUserDeleted(new Array(response.data.length).fill(false));
        })
        .catch((err) => console.error(err));
    }
  }, [keycloak.token, selectedLetter]);

  const handleSearch = () => {
    if (!userInput.trim()) return;

    if (keycloak.hasRealmRole("admin")) {
      axios
        .get(`/users/${userInput}`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setSingleUser(response.data))
        .catch((err) => console.error(err));
    }
  };

  const deleteUser = (id: string, index: number) => {
    if (keycloak.hasRealmRole("admin")) {
      axios
        .delete(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then(() => {
          setUserDeleted((previous) => {
            const updated = [...previous];
            updated[index] = true;
            return updated;
          });
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <>
      <nav>
        <input
          type="text"
          placeholder="Search for users"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!userInput.trim()}
        >
          Search
        </button>
      </nav>

      <main>
        {singleUser && (
          <nav>
            <UserComponent user={singleUser} />
          </nav>
        )}

        <div>
          {letters.map((letter) => (
            <button key={letter} onClick={() => setSelectedLetter(letter)}>
              {letter}
            </button>
          ))}
        </div>

        {selectedLetter && users.length > 0 && (
          <div>
            {users.map((user, index) => (
              <div key={user.id}>
                {!userDeleted[index] && (
                  <UserComponent user={user}>
                    <button onClick={() => deleteUser(user.id, index)}>
                      Delete User
                    </button>
                  </UserComponent>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
