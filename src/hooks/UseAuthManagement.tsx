import { useAuthStore } from "../../store";

export const useAuthManagement = () => {
  const users = useAuthStore((state) => state.users);
  const currentUser = useAuthStore((state) => state.currentUser);

  const isAdminAuth = () => {
    const user = users.find((u) => u.uid === currentUser);
    return !!user?.admin;
  };

  const isAuth = (prop: string) => {
    const user = users.find((user) => user.uid === currentUser);
    if (!user) return false;
    return user[prop] ? true : false;
  };

  const isAuths = (props: string[]) => {
    const user = users.find((user) => user.uid === currentUser);
    if (!user) return false;
    return props.some((prop: string) => (user[prop] ? true : false));
  };

  return { isAdminAuth, isAuth, isAuths };
};
