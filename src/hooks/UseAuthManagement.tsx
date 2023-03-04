import { useRecoilValue } from "recoil";
import { currentUserState, usersState } from "../../store";

export const useAuthManagement = () => {
  const users = useRecoilValue(usersState);
  const currentUser = useRecoilValue(currentUserState);

  const isAdminAuth = () => {
    const array = [
      "fgzmLExAiAcFcikzqHpqe7avIfu2",
      "EE7aC3Q3O8Q7dB7sKlFXqfQaZO22",
      'B6W7Ux55Ffbsyf9hc7RoTsVtOln1'
    ];
    const result = array.includes(currentUser);
    return result;
  };

  const isAuth = (prop: string) => {
    const user = users.find(
      (user: { uid: string; }) => user.uid === currentUser
    );
    if (!user) return false;
    return user[prop] ? true : false;
  };

  const isAuths = (props: string[]) => {
    const user = users.find(
      (user: { uid: string; }) => user.uid === currentUser
    );
    if (!user) return false;
    return props.some((prop: string) => (user[prop] ? true : false));
  };

  return { isAdminAuth, isAuth, isAuths };
};
