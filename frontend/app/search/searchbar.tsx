"use client";
import { useFormik } from "formik";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import { SearchItem, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";

export default function Searchbar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams.toString());
  const [clicked, setClicked] = useState<boolean>(false);
  const [history, setHistory] = useState<SearchItem[]>([]);
  const router = useRouter();
  const { keycloak, loading, isAuthenticated } = useContext(KeycloakContext);

  const refetchHistory = async () => {
    if (!loading && isAuthenticated && keycloak.token) {
      try {
        const response = await axios.get(`${url}/search-history`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    }
  };

  useEffect(() => {
    refetchHistory();
  }, []);

  const handleDelete = async (item: SearchItem) => {
    try {
      await axios.delete(`${url}/search-history/${item.id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      refetchHistory();
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${url}/search-history`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      refetchHistory();
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const searchForm = useFormik({
    initialValues: {
      input: "",
    },
    validationSchema: Yup.object({
      input: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post(
          `${url}/search-history`,
          { input: values.input },
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );
        await refetchHistory();
        params.set("q", values.input);
        router.push(`/search?${params.toString()}`);
      } catch (err) {
        console.error("Search submission failed:", err);
      }
    },
  });

  return (
    <form onSubmit={searchForm.handleSubmit} className="search-bar-container">
      <div>
        <input
          type="text"
          placeholder="Search"
          autoComplete="off"
          onFocus={() => setClicked(true)}
          {...searchForm.getFieldProps("input")}
        />
      </div>

      {clicked && history.length === 0 && pathname !== "/explore" && (
        <div className="empty-search-bar">
          <p>Try searching for people, lists, or keywords</p>
        </div>
      )}

      {clicked && history.length > 0 && (
        <div className="recent-searches-container">
          <header className="recent-searches-header">
            <strong>
              {" "}
              <h3>Recent</h3>
            </strong>

            <button type="button" onClick={handleClearAll}>
              Clear all
            </button>
          </header>
          <main className="search-history-container">
            {history.map((search: SearchItem) => (
              <div key={search.id} className="search-history-item">
                <>
                  <div>{search.input}</div>
                  <button type="button" onClick={() => handleDelete(search)}>
                    x
                  </button>
                </>
              </div>
            ))}
          </main>
        </div>
      )}
    </form>
  );
}
