import { JSX } from "react";
import Register from "./register";
import RegisterLayout from "./layout";
export default function RegisterPage(): JSX.Element {
  return (
    <RegisterLayout>
      <Register />
    </RegisterLayout>
  );
}
