"use client";
import { JSX, useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

export default function Login(): JSX.Element {
  const LoginForm = useFormik({
    initialValues: {
      inputValue: "",
    },
    validationSchema: Yup.object({
      inputValue: Yup.string().max(32).required("Required"),
    }),
    onSubmit: (values) => {
      axios
        .post("/login", values)
        .then((response) => {
          if (response.data) {
            sessionStorage.setItem("username", JSON.stringify(response.data));
          }
        })
        .catch((error) => console.log("Error while logging in", error));
    },
  });
  return (
    <>
      <div>Log in through Google</div>
      <div>Log in through Apple</div>
      <span>Or</span>
      <div>
        <span>Number, email or username</span>
        <input type="text" {...LoginForm.getFieldProps("inputValue")} />
        <button>Next</button>
      </div>
      <button>Forgot password?</button>
      <div>
        <span>Don't have an account?</span>
        <Link href={"/"}>Register</Link>
      </div>
    </>
  );
}
