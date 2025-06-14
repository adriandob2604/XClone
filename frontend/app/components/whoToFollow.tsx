import { useState, useContext, useEffect } from "react";
import { FollowUserProps, UserData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import axios from "axios";
import { UserComponent } from "./userComponent";
export const FollowUser: React.FC<FollowUserProps> = ({ users }) => {
  const { keycloak } = useContext(KeycloakContext);
  const [isFollowing, setIsFollowing] = useState<boolean[]>([]);
  const follow = async (user: UserData, index: number) => {
    if (user) {
      axios
        .post(
          `${url}/interactions/follow`,
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
      .delete(`${url}/interactions/unfollow/${user.id}`, {
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
  return (
    <>
      {users.map((user: UserData, index: number) => (
        <UserComponent key={user.id} user={user}>
          {!isFollowing[index] && (
            <button
              className="follow-button"
              onClick={() => follow(user, index)}
            >
              Follow
            </button>
          )}
          {isFollowing[index] && (
            <button
              className="unfollow-button"
              onClick={() => unfollow(user, index)}
            >
              Following
            </button>
          )}
        </UserComponent>
      ))}
    </>
  );
};
export function WhoToFollow() {
  const [usersToFollow, setUsersToFollow] = useState<UserData[]>([]);
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  useEffect(() => {
    if (keycloak.token && isAuthenticated) {
      axios
        .get(`${url}/users/to_follow`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setUsersToFollow(response.data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [keycloak.token, isAuthenticated]);
  return (
    <aside className="users-to-follow-container">
      <h3>
        <strong>Who to follow</strong>
      </h3>
      {usersToFollow.length === 0 && <p>No users to follow!</p>}
      {usersToFollow.length !== 0 && <FollowUser users={usersToFollow} />}
    </aside>
  );
}
