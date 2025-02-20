"use client";
import { JSX } from "react";
import Link from "next/link";

export default function Root(): JSX.Element {
  return (
    <main>
      <h3>Join</h3>
      <div>
        <button>Register through Google</button>
      </div>
      <div>
        <button>Register through Apple</button>
      </div>
      <span>Or</span>
      <Link href="/signup">Create an account</Link>
      <div>
        <h3>Already have an account?</h3>
        <Link href="/login">Log in</Link>
      </div>
    </main>
  );
}
