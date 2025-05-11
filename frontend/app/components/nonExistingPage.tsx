import Link from "next/link";

export default function NonExistingPage() {
  return (
    <main>
      <p>Hmmm...this page doesn't exist. Try searching for something else.</p>
      <Link href={"/search"}>Search</Link>
    </main>
  );
}
