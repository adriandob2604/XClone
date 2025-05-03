import axios from "axios";
import { useEffect, useState } from "react";

export default function UnsentPosts() {
  const url = "http://localhost:5000";
  const [data, setData] = useState;
  useEffect(() => {
    axios
      .get(`${url}/unsentPosts`)
      .then((response) => {
        if (response.status === 200) {
          setData(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);
}
