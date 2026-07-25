import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [focused, setFocused] = useState(false);
  const { theme, setTheme } = useTheme();

  /* hook to fetch whenever search term changes */
  useEffect(() => {
    if (search.length < 1) {
      return;
    }

    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      const result: User[] = await fetchFromPeoplyApiJson(
        `/users?name=${encodeURIComponent(search)}`,
        {
          method: "GET",
        },
      );
      // A slower request for an earlier term must not overwrite the results
      // of a later one.
      if (cancelled) {
        return;
      }
      setLoading(false);
      setSearchResults(result);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  /* Filtering here rather than in the effect keeps `excludeUsers` out of its
     dependencies - callers build it inline, so a new array identity on every
     parent render would restart the debounce. */
  const users = useMemo(() => {
    const excludedIds = new Set(excludeUsers?.map(({ id }) => id));
    return searchResults.filter(({ id }) => !excludedIds.has(id));
  }, [excludeUsers, searchResults]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
    setSearchResults([]); // clear users when search term is changed

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
          <div key={user.id}>
            <span className={styles.divider} />
            <div className={styles.item}>
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
          </div>
        ))}
      </div>
    </div>
  );
}
