"use client";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { UserData, PostData, url } from "../../utils";
import { usePathname } from "next/navigation";
import { PostComponent } from "./status/[postId]/post";
import { KeycloakContext } from "../../keycloakprovider";
import Image from "next/image";
import { WhoToFollow } from "@/app/components/whoToFollow";

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const pathname = usePathname().split("/")[2];
  const [isOwn, setIsOwn] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);

  useEffect(() => {
    if (keycloak.token && isAuthenticated) {
      const fetchData = async () => {
        try {
          const [profileResponse, postsResponse] = await Promise.all([
            axios.get(`${url}/users/${pathname}`, {
              headers: { Authorization: `Bearer ${keycloak.token}` },
            }),
            axios.get(`${url}/posts/${pathname}`, {
              headers: { Authorization: `Bearer ${keycloak.token}` },
            }),
          ]);
          setUserData(profileResponse.data.user);
          setIsOwn(profileResponse.data.isOwn);
          setPosts(postsResponse.data.posts);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [pathname, keycloak.token, isAuthenticated]);
  if (isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <main>
      {userData && (
        <main className="profile-container">
          <nav className="profile-navbar">
            <div className="name-post-count-container">
              <div>
                {userData?.name} {userData?.surname}
              </div>
              <p>{posts?.length} posts</p>
            </div>
          </nav>
          <div className="background-profile-image">
            {userData.backgroundImageUrl && (
              <Image
                src={userData.backgroundImageUrl}
                alt="user-background"
                width={64}
                height={64}
              />
            )}
            {!userData.backgroundImageUrl && <div></div>}
          </div>
          <div>
            <div className="profile-picture-and-edit-container">
              {userData.profileImageUrl && (
                <Image
                  src={userData.profileImageUrl}
                  alt="user-profile"
                  width={64}
                  height={64}
                />
              )}
              {!userData.profileImageUrl && (
                <Image
                  alt="default-profile"
                  src={"/pfp.jpg"}
                  width={64}
                  height={64}
                />
              )}
              {isOwn && <Link href={"/settings/profile"}>Edit profile</Link>}
            </div>
            <div className="user-profile-info">
              <div>
                <strong>
                  {userData?.name} {userData?.surname}
                </strong>
              </div>
              <p>@{userData?.username}</p>
              <p>{userData?.description}</p>
              <p>Joined {new Date(userData.createdOn).toLocaleDateString()}</p>
            </div>
            <div>
              <Link href={`/profile/${pathname}/following`}>
                {userData.following?.length} Following
              </Link>
              <Link href={`/profile/${pathname}/followers`}>
                {userData.followers?.length} Followers
              </Link>
            </div>
          </div>
          <main>
            <PostComponent users={[userData]} postData={posts} />
          </main>
          <footer>
            <WhoToFollow />
          </footer>
        </main>
      )}
      {!userData && (
        <>
          <header>
            <Link href={"/home"}>Back</Link>
            <h4>Profile</h4>
          </header>
          <main>
            <nav>Background</nav>
            {/* <Image></Image> */}
            <div>
              <strong>@{pathname.toString()}</strong>
            </div>
          </main>
          <footer>
            <h2>This account doesn't exist</h2>
            <p>Try searching for another.</p>
          </footer>
        </>
      )}
    </main>
  );
}
