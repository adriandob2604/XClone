import { JSX } from "react";
import HomeLayout from "./layout";
import Home from "../components/home";
export default function HomePage(): JSX.Element {
  return (
    <HomeLayout>
      <Home />
    </HomeLayout>
  );
}
