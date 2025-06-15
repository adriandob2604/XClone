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
import { useRouter } from "next/navigation";

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const pathname = usePathname().split("/")[2];
  const [isOwn, setIsOwn] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const router = useRouter();

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
            <button onClick={() => router.push("/home")}>
              <strong>Back</strong>
            </button>
            <div className="name-post-count-container">
              <div className="post-name-container">
                {userData?.name} {userData?.surname}
              </div>
              <div className="post-count-container">{posts?.length} posts</div>
            </div>
          </nav>
          <div className="background-profile-image">
            {userData.backgroundImageUrl !== "" && (
              <Image
                src={userData.backgroundImageUrl}
                alt="user-background"
                width={64}
                height={64}
              />
            )}
            {userData.backgroundImageUrl === "" && <div></div>}
          </div>
          <div className="profile-picture-and-edit-container">
            {userData.profileImageUrl && (
              <Image
                src={userData.profileImageUrl}
                alt="user-profile"
                width={128}
                height={128}
              />
            )}
            {!userData.profileImageUrl && (
              <Image
                alt="default-profile"
                src="/default-pic.jpg"
                width={128}
                height={128}
              />
            )}
            {isOwn && <Link href={"/settings/profile"}>Edit profile</Link>}
          </div>
          <div className="user-profile-info">
            <div className="user-credentials">
              <h3>
                <strong>
                  {userData?.name} {userData?.surname}
                </strong>
              </h3>
              <p>@{userData?.username}</p>
            </div>
            {userData?.description && <p>{userData.description}</p>}
            {!userData?.description && <p>No description</p>}
            <p>Joined {new Date(userData.createdOn).toLocaleDateString()}</p>
          </div>
          <div className="followers-container">
            <div>{userData.following?.length}</div>
            <Link href={`/profile/${pathname}/following`}>Following</Link>
            <div>{userData.followers?.length}</div>
            <Link href={`/profile/${pathname}/followers`}>Followers</Link>
          </div>
          <main>
            <PostComponent postData={posts} />
          </main>
          <footer className="profile-footer-container">
            <WhoToFollow />
          </footer>
        </main>
      )}
      {/* {!userData && (
        <>
          <header>
            <Link href={"/home"}>Back</Link>
            <h4>Profile</h4>
          </header>
          <main>
            <nav>Background</nav>
            <Image></Image>
            <div>
              <strong>@{pathname.toString()}</strong>
            </div>
          </main>
          <footer>
            <h2>This account doesn't exist</h2>
            <p>Try searching for another.</p>
          </footer>
        </>
      )} */}
    </main>
  );
}
