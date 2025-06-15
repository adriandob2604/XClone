"use client";
import { PostData, UserData, PostComponentProps, url } from "@/app/utils";
import axios from "axios";
import { useFormik } from "formik";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { KeycloakContext } from "@/app/keycloakprovider";
import Image from "next/image";
export const PostComponent: React.FC<PostComponentProps> = ({ postData }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [optionsClicked, setOptionsClicked] = useState<boolean[]>([]);
  const [postDeleted, setPostDeleted] = useState<boolean[]>([]);
  const { keycloak } = useContext(KeycloakContext);
  const deletePost = async (postId: string, index: number) => {
    try {
      const response = await axios.delete(`${url}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      if (response.status === 200) {
        setPostDeleted(
          (previous: boolean[]) => ((previous[index] = true), [...previous])
        );
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (keycloak.token) {
      axios
        .get(`${url}/users`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setUsers(response.data.users))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [keycloak.token]);
  return (
    <div>
      {postData?.length !== 0 && (
        <>
          {postData?.map((post: PostData, index: number) => {
            const user = users.find((u: UserData) => u.id === post.userId);
            return (
              <>
                {!postDeleted[index] && (
                  <div key={post.id}>
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
                    {/* {isOwn && optionsClicked[index] && (
                        <>
                          <button onClick={() => deletePost(post.id, index)}>
                            Delete
                          </button>
                        </>
                      )} */}
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
      {postData?.length === 0 && <h2>No posts were found!</h2>}
    </div>
  );
};

export function CreatePost() {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [userData, setUserData] = useState<UserData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const FILE_SIZE = 160 * 1024;

  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    if (keycloak.token && isAuthenticated) {
      axios
        .get(`${url}/users/me`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => setUserData(response.data))
        .catch((err) => console.error(err));
    }
  }, [keycloak.token, isAuthenticated]);

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
      console.log(values.file);
      formData.append("text", values.text);
      if (values.file) {
        formData.append("postFile", values.file);
      }
      try {
        if (keycloak.token && isAuthenticated) {
          const [postResponse, notificationResponse] = await Promise.all([
            axios.post(`${url}/posts`, formData, {
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
              },
            }),
            axios.post(
              `${url}/notifications/postNotification`,
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
        }
      } catch (err) {
        console.error(err);
      }
    },
  });

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      postForm.setFieldValue("file", file);
      setPreviewFile(file);
    }
  };

  return (
    <>
      <form
        onSubmit={postForm.handleSubmit}
        className="homepage-post-container"
      >
        <div className="post-input-container">
          {userData?.profileImageUrl ? (
            <Image
              alt="profile-pic"
              src={`${userData.profileImageUrl}`}
              width={36}
              height={36}
              className="input-profile-pic"
            />
          ) : (
            <Image
              alt="default-profile-pic"
              src="/default-pic.jpg"
              width={36}
              height={36}
              className="input-profile-pic"
            />
          )}

          <input
            type="text"
            placeholder="What's happening?!"
            autoComplete="off"
            {...postForm.getFieldProps("text")}
          />
        </div>

        {previewFile && (
          <div style={{ marginTop: "10px" }}>
            {previewFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(previewFile)}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                  display: "block",
                }}
              />
            ) : previewFile.type.startsWith("video/") ? (
              <video
                controls
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                  display: "block",
                }}
              >
                <source
                  src={URL.createObjectURL(previewFile)}
                  type={previewFile.type}
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>{previewFile.name}</p>
            )}
          </div>
        )}

        <footer className="media-container">
          <Image
            alt="media-photo"
            src="/media_twitter.PNG"
            width={16}
            height={16}
            onClick={handleImageClick}
            style={{ cursor: "pointer" }}
          />
          <input
            type="file"
            name="Media"
            accept="image/*, video/*"
            multiple={false}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            type="submit"
            className="post-button"
            disabled={!postForm.values.text}
          >
            Post
          </button>
        </footer>
      </form>
    </>
  );
}

// export function GetPosts({ url }: { url: string }) {
//   const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);
//   const [postData, setPostData] = useState<PostData[]>([]);
//   const [user, setUser] = useState<UserData[]>([]);
//   useEffect(() => {
//     if (isAuthenticated && !loading && keycloak.token) {
//       try {
//         axios
//           .get(url, {
//             headers: {
//               Authorization: `Bearer ${keycloak.token}`,
//             },
//           })
//           .then((response) => {
//             if (response.data.posts) {
//               setPostData(response.data.posts);
//             }
//             if (response.data.user) {
//               setUser(response.data.user);
//             }
//           });
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   }, [url, isAuthenticated, loading, keycloak.token]);
//   return (
//     <>
//       <PostComponent users={user} postData={postData} />
//       {postData.length === 0 && (
//         <>
//           <h2>No posts were found</h2>
//         </>
//       )}
//     </>
//   );
// }
export function GetSinglePost() {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);

  const [postData, setPostData] = useState<PostData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const postId = pathname.split("/")[-1];
  useEffect(() => {
    if (keycloak.token && isAuthenticated) {
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
    }
  }, [postId, keycloak.token, isAuthenticated]);
  if (isLoading) {
    <p>Loading...</p>;
  }
  if (postData && userData) {
    return <PostComponent postData={[postData]} />;
  }
}
