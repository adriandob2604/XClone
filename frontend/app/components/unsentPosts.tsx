import axios from "axios";
import { useEffect, useState } from "react";
import { DraftData } from "./utils";
export default function UnsentPosts() {
  const url = "http://localhost:5000";
  const [data, setData] = useState<DraftData | null>(null);
  useEffect(() => {
    axios
      .get(`${url}/unsentPosts`)
      .then((response) => {
        if (response.status === 200) {
          setData(response.data?.unsentPosts);
        }
      })
      .catch((err) => console.error(err));
  }, []);
}
