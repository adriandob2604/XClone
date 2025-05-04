import React from "react";

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <h1>Articles Layout</h1>
      </header>
      <main>{children}</main>
    </section>
  );
}
