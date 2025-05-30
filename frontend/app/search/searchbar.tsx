"use client";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import { SearchItem, url } from "../utils";
import { KeycloakContext } from "../keycloakprovider";

export default function Searchbar() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [clicked, setClicked] = useState<boolean>(false);
  const [history, setHistory] = useState<SearchItem[]>([]);
  const router = useRouter();
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);
  if (!isAuthenticated) {
    return <p>Not authenticated!</p>;
  }
  const refetchHistory = async () => {
    try {
      const response = await axios.get(`${url}/history`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    refetchHistory();
  }, []);

  const handleDelete = async (item: SearchItem) => {
    try {
      await axios.delete(`${url}/history/${item.id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      refetchHistory();
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${url}/history`, {
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
          `${url}/history`,
          { ...values },
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
    <form onSubmit={searchForm.handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Search"
          onFocus={() => setClicked(true)}
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
            <button type="button" onClick={handleClearAll}>
              Clear all
            </button>
          </header>
          <div>
            {history.map((search: SearchItem) => (
              <div key={search.id}>
                <>
                  <div>{search.input}</div>
                  <button type="button" onClick={() => handleDelete(search)}>
                    x
                  </button>
                </>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
