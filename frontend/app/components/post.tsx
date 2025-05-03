import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import * as Yup from "yup";
export default function Post() {
  const url = "http://localhost:5000";
  const postForm = useFormik({
    initialValues: {
      user: null,
      text: "",
      file: "",
      createdOn: new Date(),
    },
    validationSchema: Yup.object({
      user: Yup.object().required("Required"),
      text: Yup.string().max(256).required("Required"),
      file: Yup.object().required("Required"),
      createdOn: Yup.date().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(`${url}/posts`, { ...values });
        if (response.status === 201) {
          console.log("Succesfully posted");
        }
      } catch {
        console.error("Couldn't post");
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
          <input type="text" placeholder="What is happening?!" />
        </div>
        <footer>
          <input
            type="file"
            {...postForm.getFieldProps("file")}
            accept="image/*, video/*"
            multiple={true}
          />
          <button>Gif</button>
          <button>Emoji</button>
        </footer>

        <button type="submit">Post</button>
      </form>
    </>
  );
}
