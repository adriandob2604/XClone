import React from "react";

export default function LikesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <h1>Likes Layout</h1>
      </header>
      <main>{children}</main>
    </section>
  );
}
