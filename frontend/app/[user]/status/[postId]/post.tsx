"use client";
import { PostData, UserData, PostComponentProps, url } from "@/app/utils";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { KeycloakContext } from "@/app/keycloakprovider";
import { useRouter } from "next/navigation";

export const PostComponent: React.FC<PostComponentProps> = ({
  users,
  postData,
}) => {
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
  const [optionsClicked, setOptionsClicked] = useState<boolean[]>([]);
  const [isOwn, setIsOwn] = useState<boolean[]>([]);
  const [postDeleted, setPostDeleted] = useState<boolean[]>([]);
  const deletePost = async (postId: string, index: number) => {
    try {
      const response = await axios.delete(`${url}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      // setIsOwn(response.data.isOwn);
      if (response.status === 200) {
        setPostDeleted(
          (previous: boolean[]) => ((previous[index] = true), [...previous])
        );
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      {postData.length !== 0 && users && (
        <>
          {postData.map((post: PostData, index: number) => {
            const user = users.find((u: UserData) => u.id === post.userId);

            return (
              <>
                {!postDeleted[index] && (
                  <div key={post.id}>
                    <div>
                      <span>{`${user?.name} ${user?.surname}`}</span>
                      <span>@{user?.username}</span>
                      <span>{post.createdOn.getHours()}h</span>
                      <button
                        onClick={() =>
                          setOptionsClicked(
                            (previous: boolean[]) => (
                              (previous[index] = true), [...previous]
                            )
                          )
                        }
                      >
                        Options
                      </button>
                      {isOwn && optionsClicked[index] && (
                        <>
                          <button onClick={() => deletePost(post.id, index)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    <div>
                      <button>Like</button>
                      <button>Comment</button>
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </>
      )}
    </div>
  );
};

export function CreatePost() {
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const FILE_SIZE = 160 * 1024;
  useEffect(() => {
    axios
      .get(`${url}/me`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })
      .then((response) => setUserData(response.data))
      .catch((err) => console.error(err));
  }, []);
  const postForm = useFormik({
    initialValues: {
      text: "",
      file: null,
    },
    validationSchema: Yup.object({
      text: Yup.string().max(256).required("Required"),
      file: Yup.mixed().test(
        "fileSize",
        "File too large",
        (value) => value instanceof File && value && value.size <= FILE_SIZE
      ),
    }),
    onSubmit: async (values) => {
      const notificationMessage = `${userData?.username} posted!`;
      const formData = new FormData();
      formData.append("text", values.text);
      if (values.file) {
        formData.append("postFile", values.file);
      }
      try {
        const [postResponse, notificationResponse] = await Promise.all([
          axios.post(`${url}/posts`, formData, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }),
          axios.post(
            `${url}/notifications`,
            { notification: notificationMessage },
            {
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
              },
            }
          ),
        ]);
        if (
          postResponse.status === 201 &&
          notificationResponse.status === 201
        ) {
          console.log("Successfully posted");
        }
      } catch (err) {
        console.error(err);
      }
    },
  });
  return (
    <>
      <form onSubmit={postForm.handleSubmit}>
        <header>
          <Link href={"/home"}>Back</Link>
        </header>
        <div>
          <div>Image</div>
          <input
            type="text"
            placeholder="What is happening?!"
            {...postForm.getFieldProps("text")}
          />
        </div>
        <footer>
          <input
            type="file"
            name="Media"
            accept="image/*, video/*"
            multiple={true}
            onChange={(event) =>
              postForm.setFieldValue("file", event.currentTarget.files?.[0])
            }
          />
        </footer>
        <button type="submit">Post</button>
      </form>
    </>
  );
}

export function GetPosts({ url }: { url: string }) {
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
  const [postData, setPostData] = useState<PostData[]>([]);
  const [user, setUser] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    try {
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          if (response.data.posts) {
            setPostData(response.data.posts);
          }
          if (response.data.user) {
            setUser(response.data.user);
          }
        });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);
  if (isLoading) {
    return <></>;
  }
  return (
    <>
      <PostComponent users={user} postData={postData} />
      {postData.length === 0 && (
        <>
          <h2>No posts were found</h2>
        </>
      )}
    </>
  );
}
export function GetSinglePost() {
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
  const [postData, setPostData] = useState<PostData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const postId = pathname.split("/")[-1];
  useEffect(() => {
    try {
      axios
        .get(`${url}/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          setPostData(response.data.post);
          setUserData(response.data.user);
        });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);
  if (isLoading) {
    <p>Loading...</p>;
  }
  if (postData && userData) {
    return <PostComponent users={[userData]} postData={[postData]} />;
  }
}
