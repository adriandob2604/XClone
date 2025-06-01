import Image from "next/image";
import { UserComponentProps } from "../utils";

export const UserComponent = ({ user, children }: UserComponentProps) => {
  return (
    <div key={user.id}>
      <Image src={user.profileImageUrl} alt="User" width={300} height={300} />
      <div>
        {user.name} {user.surname}
      </div>
      <div>@{user.username}</div>
      <div>{user.createdOn.getDate()}</div>
      {children}
    </div>
  );
};
