import { useEffect, useState } from "react";
import { FollowUserProps, UserData } from "../utils";
import axios from "axios";
export const FollowUser: React.FC<FollowUserProps> = ({
  users,
  isFollowing,
  setIsFollowing,
}) => {
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
          {!isFollowing && (
            <button
              onClick={() =>
                setIsFollowing((previous: boolean | null) => !previous)
              }
            >
              Follow
            </button>
          )}
          {isFollowing && (
            <button
              onClick={() =>
                setIsFollowing((previous: boolean | null) => !previous)
              }
            >
              Following
            </button>
          )}
        </div>
      ))}
    </>
  );
};
export default function WhoToFollow() {
  const url = "http://localhost:5000";
  const [users, setUsers] = useState<UserData[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${url}/to_follow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setUsers(response.data));
  }, []);
  useEffect(() => {
    if (isFollowing) {
      axios
        .post(`${url}/followers`, followUser, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => console.log(response.status))
        .catch((err) => console.error(err));
    }
    if (!isFollowing && followUser) {
      axios
        .delete(`${url}/followers/${followUser}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => console.log(response.status))
        .catch((err) => console.error(err));
    }
  }, [isFollowing]);

  if (users.length > 0) {
    return (
      <FollowUser
        users={users}
        isFollowing={isFollowing}
        setIsFollowing={setIsFollowing}
      />
    );
  }
  return (
    <div>
      <p>No users to follow!</p>
    </div>
  );
}
