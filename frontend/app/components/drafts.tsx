import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";

type DraftData = {
  unsentPosts: string;
  scheduledPosts: string;
};
export default function Drafts() {
  const url = "http://localhost:5000";
  const [drafts, setDrafts] = useState<DraftData | null>(null);
  useEffect(() => {
    try {
      axios.get(`${url}/drafts`).then((response) => {
        if (response.status === 200) {
          setDrafts(response.data);
        }
      });
    } catch {
      console.log("No drafts were found");
    }
  }, []);
  return (
    <>
      <header>
        <button>Back</button>
        <h4>Drafts</h4>
      </header>
      <nav>
        <Link href={"/compose/post/unsent/drafts"}>Unsent posts</Link>
        <Link href={"/compose/post/unsent/scheduled"}>Scheduled posts</Link>
      </nav>
    </>
  );
}
