"use client";
import { JSX } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Root(): JSX.Element {
  return (
    <main className="root-container">
      <div className="logo-container">
        <Image
          alt="Logo"
          src="/logo.png"
          className="logo-container"
          width={512}
          height={512}
        />
      </div>
      <div className="create-account-container">
        <h1>The Freshest news from around the world</h1>
        <h3>Join today.</h3>
        <div>
          <div className="create-login-container">
            <div className="register-container">
              <Image
                alt="Google logo"
                src="/google.png"
                width={24}
                height={24}
              />
              <div>Register through Google</div>
            </div>
            <div className="register-container">
              <Image alt="Apple logo" src="/apple.png" width={24} height={24} />
              <div>Register through Apple</div>
            </div>
            <div className="or">Or</div>
            <div className="register-container">
              <Link href="/signup">Create an account</Link>
            </div>
            <div>Already have an account?</div>
            <div className="register-container">
              <Link href="/login">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
