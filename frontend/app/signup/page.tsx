import { JSX } from "react";
import RegisterLayout from "./layout";
import Register from "./register";
export default function RegisterPage(): JSX.Element {
  return (
    <RegisterLayout>
      <Register />
    </RegisterLayout>
  );
}
