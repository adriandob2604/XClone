"use client";
import { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Root(): JSX.Element {
  const router = useRouter();
  const redirectUri = "http://localhost:3000/home";
  return (
    <main className="root-container">
      <div className="logo-container">
        <Image
          alt="Logo"
          src="/logo.png"
          className="logo-container"
          width={600}
          height={600}
          priority={true}
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
              {/* <button onClick={() => SocialLogin("google")}> */}
              Register through Google
              {/* </button> */}
            </div>
            <div className="register-container">
              <Image alt="Apple logo" src="/apple.png" width={24} height={24} />
              {/* <button onClick={() => SocialLogin("apple")}> */}
              Register through Apple
              {/* </button> */}
            </div>
            <div className="or-container">
              <div className="separator"></div>
              <div>Or</div>
              <div className="separator"></div>
            </div>
            <Link href="/signup" className="register-container">
              Create an account
            </Link>
            <div className="reminder">Already have an account?</div>
            <Link href={"/login"}>Log in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
