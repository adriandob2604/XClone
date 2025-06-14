import Image from "next/image";
import { UserComponentProps } from "../utils";
import { usePathname } from "next/navigation";

export const UserComponent = ({ user, children }: UserComponentProps) => {
  const pathname = usePathname();
  return (
    <div key={user.id} className="user-container">
      <div className="account-details">
        {user.profileImageUrl && (
          <Image src={user.profileImageUrl} alt="User" width={32} height={32} />
        )}
        {!user.profileImageUrl && (
          <Image src={"/pfp.jpg"} alt="User" width={32} height={32} />
        )}
        <div className="user-info">
          <div>
            {user.name} {user.surname}
          </div>
          <div>@{user.username}</div>
        </div>
        {pathname !== "/home" && (
          <div>{new Date(user.createdOn).getDate().toString()}</div>
        )}
      </div>

      {children}
    </div>
  );
};
