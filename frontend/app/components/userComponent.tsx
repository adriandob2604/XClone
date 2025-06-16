import Image from "next/image";
import { UserComponentProps } from "../utils";
import { usePathname } from "next/navigation";

export const UserComponent = ({ user, children }: UserComponentProps) => {
  return (
    <div key={user.id} className="user-container">
      <div className="account-details">
        {user.profileImageUrl && (
          <Image src={user.profileImageUrl} alt="User" width={48} height={48} />
        )}
        {!user.profileImageUrl && (
          <Image src={"/default-pic.jpg"} alt="User" width={48} height={48} />
        )}
      </div>
      <div className="user-info">
        <div>
          {user.name} {user.surname}
        </div>
        <div>@{user.username}</div>
      </div>
      {children}
    </div>
  );
};
