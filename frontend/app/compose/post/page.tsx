"use client";
import React from "react";
import PostLayout from "./layout";
import { CreatePost } from "@/app/profile/[user]/status/[postId]/post";
export default function PostPage() {
  return (
    <PostLayout>
      <CreatePost />
    </PostLayout>
  );
}
