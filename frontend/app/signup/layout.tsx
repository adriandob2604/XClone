import React, { JSX } from "react";
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
