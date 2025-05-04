import React from "react";

export default function HighlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <h1>Highlights Layout</h1>
      </header>
      <main>{children}</main>
    </section>
  );
}
