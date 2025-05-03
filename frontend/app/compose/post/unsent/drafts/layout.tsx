import React from "react";

export default function DraftsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <h1>Drafts Layout</h1>
      </header>
      {children}
    </section>
  );
}
