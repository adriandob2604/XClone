import { JSX } from "react";
import Root from "./components/root";
import RootLayout from "./layout";
export default function RootPage(): JSX.Element {
  return (
    <RootLayout>
      <Root />
    </RootLayout>
  );
}
