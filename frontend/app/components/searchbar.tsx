import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Searchbar() {
  const router = useRouter();
  const [clicked, setClicked] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);
  return (
    <>
      <div onClick={() => setClicked((previous: boolean) => !previous)}>
        <img src="" alt="" />
        <input type="text" />
      </div>
      {clicked && <div></div>}
    </>
  );
}
