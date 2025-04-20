"use client";
import { JSX, useState } from "react";
import Link from "next/link";
import { Formik, useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { useRouter } from "next/navigation";

export default function Login(): JSX.Element {
  const [clicked, setClicked] = useState<boolean>(false);
  const router = useRouter();
  const LoginForm = useFormik({
    initialValues: {
      inputValue: "",
      password: "",
    },
    validationSchema: Yup.object({
      inputValue: Yup.string().max(32).required("Required"),
      password: Yup.string().max(32).required("Required"),
    }),
    onSubmit: (values) => {
      axios
        .post("/login", values)
        .then((response) => {
          if (response.status === 200 && response.data) {
            console.log(response.status);
            sessionStorage.setItem("token", JSON.stringify(response.data));
            sessionStorage.setItem("username", values.inputValue);
            router.push("/home");
          }
        })
        .catch((error) => console.log("Error while logging in", error));
    },
  });
  return (
    <>
      {!clicked && (
        <>
          <div>Log in through Google</div>
          <div>Log in through Apple</div>
          <span>Or</span>
          <div>
            <span>Number, email or username</span>
            <input type="text" {...LoginForm.getFieldProps("inputValue")} />
            <button onClick={() => setClicked((previous) => !previous)}>
              Next
            </button>
          </div>
          <button>Forgot password?</button>
          <div>
            <span>Don't have an account?</span>
            <Link href={"/signup"}>Sign up</Link>
          </div>
        </>
      )}
      {clicked && (
        <>
          <nav>
            <div>
              <button onClick={() => setClicked((previous) => !previous)}>
                x
              </button>
              {/* <Image></Image> */}
            </div>
          </nav>
          <h2>Enter your password</h2>
          <form onSubmit={LoginForm.handleSubmit}>
            <input type="password" {...LoginForm.getFieldProps("password")} />
            <button type="submit">Log in</button>
          </form>
          <div>
            <div></div>
            <div></div>
          </div>
        </>
      )}
    </>
  );
}
