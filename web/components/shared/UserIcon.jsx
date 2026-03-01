import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const UserIcon = ({ user, className }) => {
  return (
    <>
      <Avatar className={className}>
        <AvatarImage src={user.profilePicture?.url ?? user.googleImageUrl ?? ""} alt={user.firstName ?? user.email} />
        <AvatarFallback>{getInitials(user)}</AvatarFallback>
      </Avatar>
    </>
  );
};

const getInitials = (user) => {
  if (user.firstName || user.lastName) {
    return ((user.firstName?.slice(0, 1) ?? "") + (user.lastName?.slice(0, 1) ?? "")).toUpperCase();
  } else {
    return user.email.slice(0, 1);
  }
};