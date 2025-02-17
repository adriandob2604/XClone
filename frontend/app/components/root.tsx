'use client'
import { JSX } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Root(): JSX.Element {
    return <main>
        <h3>Join</h3>
        <div>
            <button>Register through Google</button>
        </div>
        <div>
            <button>Register through Apple</button>
        </div>
        <span>Or</span>
        <Link href="/signup">Create an account
        </Link>
    </main>
}