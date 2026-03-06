import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/UserSearch.module.scss";
import { User } from "../types/types";
import AddIcon from "./AddIcon";
import Avatar from "./Avatar";
import LoadingWheel from "./LoadingWheel";
import CheckIcon from "./svgs/CheckIcon";
import SearchIcon from "./svgs/SearchIcon";
import { useTheme } from "next-themes";

interface UserSearchProps {
  onUserSelect: (user: User) => void;
  onUserRemove: (user: User) => void;
  selectedUsers: User[];
  excludeUsers?: User[];
}

export default function UserSelect({
  onUserSelect,
  onUserRemove,
  selectedUsers,
  excludeUsers,
}: UserSearchProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [focused, setFocused] = useState(false);
  const { theme, setTheme } = useTheme();
  const [queuedSearch, setQueuedSearch] =
    useState<ReturnType<typeof setTimeout>>();

  /* hook to fetch whenever search term changes */
  useEffect(() => {
    const performSearch = async () => {
      const result: User[] = await fetchFromPeoplyApiJson(
        `/users?name=${search}`,
        {
          method: "GET",
        },
      );
      setLoading(false);
      /* filter out excluded users */
      setUsers(
        result.filter(({ id }) => !excludeUsers?.map((u) => u.id).includes(id)),
      );
    };
    if (search.length >= 1) {
      setLoading(true);
      const req: ReturnType<typeof setTimeout> = setTimeout(
        () => performSearch(),
        300,
      );
      setQueuedSearch(req);
    }
  }, [search, excludeUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
    setUsers([]); // clear users when search term is changed
    if (queuedSearch) {
      clearTimeout(queuedSearch);
    }

    if (query.length < 1) {
      setLoading(false);
    }
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some((u) => u.id === user.id);
  };

  return (
    <div className={`${styles.wrapper} ${users.length ? styles.show : ""}`}>
      <div
        className={`${styles.container} ${focused && styles.focused} ${
          users.length ? styles.show : ""
        }`}
      >
        {loading ? <LoadingWheel dark={theme === "light"} /> : <SearchIcon />}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          type="text"
          value={search}
          onChange={handleChange}
        />
      </div>
      <div className={`${styles.results} ${users.length ? styles.show : ""}`}>
        {users.map((user) => (
          <>
            <span className={styles.divider} />
            <div key={user.id} className={styles.item}>
              <Link href={`/users/${user.id}`} className={styles.user}>
                <Avatar user={user} />
                <div>{`${user.firstName} ${user.lastName}`}</div>
              </Link>
              {isUserSelected(user) ? (
                <button
                  className={styles.action}
                  onClick={() => onUserRemove(user)}
                >
                  <CheckIcon className={styles.check} />
                </button>
              ) : (
                <button
                  className={styles.action}
                  onClick={() => onUserSelect(user)}
                >
                  <AddIcon classNames={styles.icon} />
                </button>
              )}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
