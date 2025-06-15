"use client";
import { JSX, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { KeycloakContext } from "../keycloakprovider";
import { useRouter } from "next/navigation";
export default function Root(): JSX.Element {
  const { login, isAuthenticated, loading } = useContext(KeycloakContext);
  const router = useRouter();
  const handleKeycloakLogin = () => {
    login({
      redirectUri: `${window.location.origin}/home`,
    });
  };
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push("/home");
    }
  }, [isAuthenticated, loading]);
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
