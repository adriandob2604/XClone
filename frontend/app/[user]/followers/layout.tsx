import React from "react";

export default function FollowersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>Followers</h2>
      <div>{children}</div>
    </section>
  );
}
