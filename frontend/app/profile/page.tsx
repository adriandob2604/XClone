import { JSX } from "react";
import ProfileLayout from "./layout";
import Profile from "../components/profile";
export default function ProfilePage(): JSX.Element {
  return (
    <ProfileLayout>
      <Profile />
    </ProfileLayout>
  );
}
