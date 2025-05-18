import { useEffect, useState } from "react";
import { UserData } from "../utils";
import axios from "axios";

export default function WhoToFollow() {
  const url = "http://localhost:5000";
  const [users, setUsers] = useState<UserData[]>([]);
  const [followUser, setFollowUser] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean | null>(false);
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
  }, [followUser, isFollowing]);

  if (users.length > 0) {
    return (
      <div>
        {users.map((user: UserData, index) => (
          <div key={`${user.username}-${index}`}>
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
      </div>
    );
  } else {
    return (
      <div>
        <p>No users to follow!</p>
      </div>
    );
  }
}
