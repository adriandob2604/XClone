import { JSX } from "react";
import Link from "next/link";

export default function Login(): JSX.Element {
  return (
    <>
      <div>Log in through Google</div>
      <div>Log in through Apple</div>
      <span>Or</span>
      <div>
        <span>Number, email or username</span>
        <input type="text" />
      </div>
      <button>Next</button>
      <button>Forgot password?</button>
      <div>
        <span>Don't have an account?</span>
        <Link href={"/"}>Register</Link>
      </div>
    </>
  );
}
