import { useState, useContext, useEffect } from "react";
import { FollowUserProps, Follower, UserData, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";
import axios from "axios";
import { UserComponent } from "./userComponent";
export const FollowUser: React.FC<FollowUserProps> = ({ users }) => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [isFollowing, setIsFollowing] = useState<boolean[]>([]);
  const [me, setMe] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    if (keycloak.token && isAuthenticated) {
      try {
        const response = await axios.get(`${url}/users/me`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        setMe(response.data);

        // Inicjalizujemy isFollowing
        const followingIds = response.data.following.map(
          (f: Follower) => f.userId
        );
        const initialFollowingState = users.map((u: UserData) =>
          followingIds.includes(u.id)
        );
        setIsFollowing(initialFollowingState);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [keycloak.token, isAuthenticated, users]);

  const follow = async (user: UserData, index: number) => {
    try {
      const response = await axios.post(
        `${url}/interactions/follow`,
        { id: user.id },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      if (response.status === 201) {
        const updated = [...isFollowing];
        updated[index] = true;
        setIsFollowing(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unfollow = async (user: UserData, index: number) => {
    try {
      const response = await axios.delete(
        `${url}/interactions/unfollow/${user.id}`,
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      if (response.status === 200) {
        const updated = [...isFollowing];
        updated[index] = false;
        setIsFollowing(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="follow-container">
      {users.map((user: UserData, index: number) => (
        <UserComponent key={user.id} user={user}>
          {!isFollowing[index] ||
          !me?.following.some((f: Follower) => f.userId === user.id) ? (
            <button
              className="follow-button"
              onClick={() => follow(user, index)}
            >
              Follow
            </button>
          ) : (
            <button
              className="unfollow-button"
              onClick={() => unfollow(user, index)}
            >
              Following
            </button>
          )}
        </UserComponent>
      ))}
    </div>
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
