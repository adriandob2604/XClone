import LoginLayout from "./layout";
import Login from "./login";
import { JSX } from "react";
export default function LoginPage(): JSX.Element {
  return (
    <>
      <LoginLayout>
        <Login />
      </LoginLayout>
    </>
  );
}
