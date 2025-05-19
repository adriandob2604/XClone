"use client";
import { PostData, UserData } from "@/app/utils";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
type PostProps = {
  url: string;
};
export function CreatePost() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const token = localStorage.getItem("token");
  const url = "http://localhost:5000";
  const FILE_SIZE = 160 * 1024;
  useEffect(() => {
    axios
      .get(`${url}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      file: Yup.mixed()
        .required("Required")
        .test(
          "fileSize",
          "File too large",
          (value) => value instanceof File && value && value.size <= FILE_SIZE
        ),
    }),
    onSubmit: async (values) => {
      const notificationMessage = `${userData?.username} posted!`;
      const formData = new FormData();
      formData.append("userId", userData?.id || "");
      formData.append("text", values.text);
      if (values.file) {
        formData.append("file", values.file);
      }
      try {
        const [postResponse, notificationResponse] = await Promise.all([
          axios.post(`${url}/posts`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.post(
            `${url}/notifications`,
            {
              notification: notificationMessage,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
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
          <button>Back</button>
          <button>Drafts</button>
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
            name="file"
            accept="image/*, video/*"
            multiple={true}
            onChange={(event) =>
              postForm.setFieldValue("file", event.currentTarget.files?.[0])
            }
          />
          <button>Gif</button>
          <button>Emoji</button>
        </footer>

        <button type="submit">Post</button>
      </form>
    </>
  );
}

export function GetPosts({ url }: PostProps) {
  const [postData, setPostData] = useState<PostData[]>([]);
  const [optionsClicked, setOptionsClicked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname().replace("/", "");
  const token = localStorage.getItem("token");
  useEffect(() => {
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setPostData(response.data.posts))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [pathname]);
  if (isLoading) {
    return <></>;
  } else {
    return (
      <div>
        {postData?.length > 0 && (
          <>
            {postData.map((post: PostData) => (
              <div>
                <div>
                  <span>{`${post.user.name} ${post.user.surname}`}</span>
                  <span>@{post.user.username}</span>
                  <span>{post.createdOn.getHours()}h</span>
                  <button
                    onClick={() =>
                      setOptionsClicked((previous: boolean) => !previous)
                    }
                  >
                    Options
                  </button>
                  {optionsClicked && (
                    <>
                      <button>Delete</button>
                      <button>Edit</button>
                    </>
                  )}
                </div>
                <div>
                  <button>Like</button>
                  <button>Comment</button>
                </div>
              </div>
            ))}
          </>
        )}
        {postData?.length === 0 && (
          <>
            <h2>No posts were found</h2>
          </>
        )}
      </div>
    );
  }
}
export function GetSinglePost() {
  const url = "http://localhost:5000";
  const [postData, setPostData] = useState<PostData | null>(null);
  const [moreClicked, setMoreClicked] = useState<boolean>(false);
  const pathname = usePathname();
  const postId = pathname.split("/")[-1];
  const username = localStorage.getItem("username");
  useEffect(() => {
    axios
      .get(`${url}/posts/${postId}`)
      .then((response) => setPostData(response.data))
      .catch((err) => console.error(err));
  }, [postId]);
  if (postData) {
    return (
      <>
        <header>
          <Link href={`/${username}`}>Back</Link>
          <h4>Post</h4>
        </header>
        <nav>
          {/* <Image></Image> */}
          <div>
            <span>
              {postData.user.name} {postData.user.surname}
            </span>
            <span>@{postData.user.username}</span>
          </div>
          <button>More</button>
          {/* {moreClicked && } */}
        </nav>
      </>
    );
  }
}
export function UpdatePost() {
  const url = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const [postData, setPostData] = useState<PostData | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    axios
      .get(`${url}/${pathname}`)
      .then((response) => setPostData(response.data))
      .catch((err) => console.error(err));
  }, []);
  if (!postData) {
    return <div>Loading...</div>;
  }
  const updateForm = useFormik({
    initialValues: {
      text: postData?.text,
      file: postData?.file,
    },
    validationSchema: Yup.object({
      text: Yup.string().min(1).required("Required"),
      file: Yup.mixed(),
    }),
    onSubmit: (values) => {
      axios
        .put(
          `${url}/${pathname}`,
          {
            text: values.text,
            file: values.file,
            modifiedAt: Date.now(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) =>
          console.log("Post succesfully updated", response.data)
        )
        .catch((err) => console.error(err));
    },
  });
  return <></>;
}
export function DeletePost() {}
