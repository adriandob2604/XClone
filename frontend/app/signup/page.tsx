import { JSX } from "react";
import Register from "./register";
import RegisterLayout from "./layout";
export default function RegisterPage(): JSX.Element {
  return (
    <RegisterLayout>
      <h2>Create an account</h2>
      <Register />
    </RegisterLayout>
  );
}
