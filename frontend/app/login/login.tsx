"use client";
import { JSX, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Formik, useFormik } from "formik";
import keycloak from "../lib/keycloak";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { url } from "@/app/utils";
import { KeycloakContext } from "../keycloakprovider";

export default function Login(): JSX.Element {
  const [clicked, setClicked] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useContext(KeycloakContext);
  const handleKeycloakLogin = () => {
    login();
  };

  const LoginForm = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().max(32).required("Required"),
      password: Yup.string().max(32).required("Required"),
    }),
    onSubmit: async (values) => {
      axios
        .post(`${url}/login`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.status === 201) {
            console.log("Successfully logged in");
            router.push("/home");
          }
        })
        .catch((err) => console.error(err));
    },
  });

  return (
    <>
      {!clicked && (
        <>
          <button>Log in through Google</button>
          <button>Log in through Apple</button>
          <button onClick={handleKeycloakLogin}>Login through Keycloak</button>
          <span>Or</span>
          <div>
            <span>Number, email or username</span>
            <input type="text" {...LoginForm.getFieldProps("username")} />
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
