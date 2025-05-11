import PostLayout from "./layout";
import { GetSinglePost } from "./post";
export default function PostPage() {
  return (
    <PostLayout>
      <GetSinglePost />
    </PostLayout>
  );
}
