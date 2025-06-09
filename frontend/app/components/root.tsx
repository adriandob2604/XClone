"use client";
import { JSX, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { KeycloakContext } from "../keycloakprovider";
export default function Root(): JSX.Element {
  const { login } = useContext(KeycloakContext);
  const handleKeycloakLogin = () => {
    login({
      redirectUri: `${window.location.origin}/home`,
    });
  };
  return (
    <main className="root-container">
      <div className="logo-container">
        <Image
          alt="Logo"
          src="/logo.png"
          className="logo-container"
          width={480}
          height={480}
          priority={true}
        />
      </div>
      <div className="account-container">
        <h1>The Freshest news from around the world</h1>
        <h3>Join today.</h3>
        <Link href="/signup">Create an account</Link>
        <div className="reminder">Already have an account?</div>
        <button onClick={handleKeycloakLogin}>Log in</button>
      </div>
    </main>
  );
}
