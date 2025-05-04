import React from "react";

export default function WithRepliesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <h1>Replies Layout</h1>
      </header>
      <main>{children}</main>
    </section>
  );
}
