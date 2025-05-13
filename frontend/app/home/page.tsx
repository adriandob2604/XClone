import { JSX } from "react";
import HomeLayout from "./layout";
import { HomeMainPage } from "./home";
export default function HomePage(): JSX.Element {
  return (
    <HomeLayout>
      <HomeMainPage />
    </HomeLayout>
  );
}
