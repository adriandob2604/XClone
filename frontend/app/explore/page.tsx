import { JSX } from "react";
import ExploreLayout from "./layout";
import Home from "../home/home";
import Explore from "./explore";
export default function ExplorePage(): JSX.Element {
  return (
    <ExploreLayout>
      <Explore />
    </ExploreLayout>
  );
}
