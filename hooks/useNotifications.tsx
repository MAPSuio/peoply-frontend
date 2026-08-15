import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import type {
  NotificationsContextType,
  PeoplyNotification,
} from "../types/types";
import useUser from "./useUser";

const NotificationContext = createContext<NotificationsContextType>(
  {} as NotificationsContextType,
);

export function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { user } = useUser();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const {
    data: notifications,
    error: notificationError,
    mutate: mutateNotifications,
  } = useSWR<PeoplyNotification[]>(
    () => (user ? `/users/${user.id}/notifications` : false),
    fetchFromPeoplyApiJson,
    /* No refreshInterval: a request every 7 seconds from every open tab is a
       lot of load for invitations that arrive a few times a week. SWR still
       revalidates on mount and on focus, and `reload` is exposed for the
       flows that accept or decline one. */
    {},
  );

  useEffect(() => {
    if (!notifications?.length) {
      setHasUnreadNotifications(false);
      return;
    }
    const stored = window.localStorage.getItem("notificationsRead");
    if (stored) {
      /* compare localstorage with current notifications */
      const notificationsRead: string[] = JSON.parse(stored);
      const currentNotifications = notifications?.map(({ id }) => id);
      const allRead = currentNotifications?.every((id) => {
        return notificationsRead?.includes(id);
      });
      setHasUnreadNotifications(!allRead);
    } else {
      setHasUnreadNotifications(true);
    }
  }, [notifications]);

  const memoizedState = useMemo(() => {
    /* marks all current notifications as read */
    const markAsRead = async () => {
      if (!notifications) {
        return;
      }
      window.localStorage.setItem(
        "notificationsRead",
        JSON.stringify(notifications?.map(({ id }) => id)),
      );

      setHasUnreadNotifications(false);
    };
    return {
      notifications,
      notificationError,
      reload: mutateNotifications,
      hasUnreadNotifications,
      markAsRead,
    };
  }, [
    notifications,
    notificationError,
    mutateNotifications,
    hasUnreadNotifications,
  ]);

  return (
    <NotificationContext.Provider value={memoizedState}>
      {children}
    </NotificationContext.Provider>
  );
}

/* for use in components */
export default function useNotifications() {
  return useContext(NotificationContext);
}
