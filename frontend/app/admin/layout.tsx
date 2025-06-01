import React, { JSX, ReactNode } from "react";
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <main>{children}</main>;
}
