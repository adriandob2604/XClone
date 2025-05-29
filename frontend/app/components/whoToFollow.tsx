import { useState, useContext } from "react";
import { FollowUserProps, UserData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import axios from "axios";
export const FollowUser: React.FC<FollowUserProps> = ({ users }) => {
  const keycloak = useContext(KeycloakContext);
  const [isFollowing, setIsFollowing] = useState<boolean[]>([]);
  const follow = async (user: UserData, index: number) => {
    if (user) {
      axios
        .post(
          `${url}/follow`,
          {
            id: user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 201) {
            setIsFollowing(
              (previous: boolean[]) => ((previous[index] = true), [...previous])
            );
          }
        })
        .catch((err) => console.error(err));
    }
  };
  const unfollow = async (user: UserData, index: number) => {
    axios
      .delete(`${url}/unfollow/${user.id}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setIsFollowing(
            (previous: boolean[]) => ((previous[index] = false), [...previous])
          );
        }
      })
      .catch((err) => console.error(err));
  };
  if (users.length > 0) {
    return (
      <>
        {users.map((user: UserData, index: number) => (
          <div key={`${user.id}-${index}`}>
            {/* <Image></Image> */}
            <div>
              <span>
                {user.name} {user.surname}
              </span>
              <span>@{user.username}</span>
            </div>
            {!isFollowing[index] && (
              <button onClick={() => follow(user, index)}>Follow</button>
            )}
            {isFollowing[index] && (
              <button onClick={() => unfollow(user, index)}>Following</button>
            )}
          </div>
        ))}
      </>
    );
  }
};
