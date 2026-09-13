import Link from "./Link";
import { useMemo, useState } from "react";
import useDebouncedSearch from "../hooks/useDebouncedSearch";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/UserSearch.module.scss";
import type { User } from "../types/types";
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
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();

  const { results: searchResults, loading } = useDebouncedSearch(
    search,
    (name: string): Promise<User[]> =>
      fetchFromPeoplyApiJson(`/users?name=${encodeURIComponent(name)}`, {
        method: "GET",
      }),
    { delayMs: 300, minLength: 1 },
  );

  const users = useMemo(() => {
    const excludedIds = new Set(excludeUsers?.map(({ id }) => id));
    return (searchResults ?? []).filter(({ id }) => !excludedIds.has(id));
  }, [excludeUsers, searchResults]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
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
          type="search"
          value={search}
          onChange={handleChange}
          aria-label="Søk etter personer"
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
                  type="button"
                  className={styles.action}
                  onClick={() => onUserRemove(user)}
                >
                  <CheckIcon className={styles.check} />
                </button>
              ) : (
                <button
                  type="button"
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
