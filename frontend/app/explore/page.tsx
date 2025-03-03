import { JSX } from "react";
import ExploreLayout from "./layout";
import Home from "../components/home";
export default function ExplorePage(): JSX.Element {
  return (
    <ExploreLayout>
      <Home />
    </ExploreLayout>
  );
}
