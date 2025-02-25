import React, { JSX } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
