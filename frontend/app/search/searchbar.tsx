"use client";
import { useFormik } from "formik";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
export default function Searchbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
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
  const searchForm = useFormik({
    initialValues: {
      input: "",
    },
    validationSchema: Yup.object({
      input: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      params.set("q", values.input);
      router.push(`/search?${params.toString()}`);
    },
  });
  return (
    <>
      <form onSubmit={searchForm.handleSubmit}>
        <div>
          {/* <img src="" alt="" /> */}
          <input
            type="text"
            placeholder="Search"
            onFocus={() => setClicked((previous: boolean) => !previous)}
            {...searchForm.getFieldProps("input")}
          />
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
      </form>
    </>
  );
}
