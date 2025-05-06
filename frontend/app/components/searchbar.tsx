import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Searchbar() {
  const router = useRouter();
  const [clicked, setClicked] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    setInitialized(true);
  }, []);
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("history", JSON.stringify(history));
    }
  }, [initialized, history]);

  const removeHistoryItem = (index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <>
      <div onClick={() => setClicked((previous: boolean) => !previous)}>
        <img src="" alt="" />
        <input type="text" placeholder="Search" />
      </div>
      {clicked && history.length === 0 && (
        <div>
          <p>Try searching for people, lists, or keywords</p>
        </div>
      )}
      {clicked && history.length > 0 && (
        <div>
          <header>
            <h4>Recent</h4>
            <button onClick={() => setHistory((_: string[]) => [])}>
              Clear all
            </button>
          </header>
          {history.map((search: string, index: number) => (
            <>
              <img src="" alt="" />
              <div>{search}</div>
              <button onClick={() => removeHistoryItem(index)}>x</button>
            </>
          ))}
        </div>
      )}
    </>
  );
}
