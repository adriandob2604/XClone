import React, { JSX, ReactNode } from "react";
export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
