// import Image from "next/image";

import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { JSX, Dispatch, SetStateAction } from "react";
import * as Yup from "yup";
export default function PostComponent({
  postClicked,
  setPostClicked,
}: {
  postClicked: boolean;
  setPostClicked: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const pathname = usePathname();
  const PostForm = useFormik({
    initialValues: {
      post: "",
    },
    validationSchema: Yup.object({
      post: Yup.string().min(1).max(256).required("Required"),
    }),
    onSubmit: (values) => {
      axios
        .post("/posts", values)
        .then((response) => response.status)
        .catch((error) => console.log("Error while posting", error));
    },
  });
  return (
    <>
      {postClicked ? (
        <>
          <form className="post-container" onSubmit={PostForm.handleSubmit}>
            <nav>
              <button onClick={() => setPostClicked(!postClicked)}>x</button>
              <Link href={`${pathname}/drafts`}>Drafts</Link>
            </nav>
            <main>
              {/* <Image alt="profile-pic" src="/" /> */}
              <input
                type="text"
                placeholder="What is happening?!"
                {...PostForm.getFieldProps("post")}
              ></input>
            </main>
            <footer>
              <div>
                {/* <Image alt="media" src="/" /> */}
                {/* <Image alt="gif" src="/" /> */}
                {/* <Image alt="emoji" src="/" /> */}
              </div>
              <button type="submit">Post</button>
            </footer>
          </form>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
