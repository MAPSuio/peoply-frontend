import { Organization, SnackTypes } from "../types/types";
import styles from "../styles/ChangeContextMenu.module.scss";
import useUser from "../hooks/useUser";
import useSnack from "../hooks/useSnack";
import Avatar from "./Avatar";

interface ChangeContextMenuProps {
  onClose: () => void;
}

export default function ChangeContextMenu({ onClose }: ChangeContextMenuProps) {
  const { user, orgs, currentOrg, switchContext } = useUser();
  const { addSnack } = useSnack();

  const sortOrgs = (orgs?: Organization[]) =>
    orgs?.sort((a, b) => a.name.localeCompare(b.name));

  /* function to switch context to a different org - omit arg to switch to user */
  const switchContextHandler = (org?: Organization) => {
    switchContext(org);
    if (org) {
      addSnack(`Byttet til ${org?.name}.`, SnackTypes.SUCCESS);
    } else {
      addSnack(`Byttet tilbake til din bruker.`, SnackTypes.SUCCESS);
    }
    onClose();
  };

  if (!user) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <span className={styles.divider} />
      <button
        className={`${styles.item} ${!currentOrg ? styles.active : ""}`}
        tabIndex={0}
        onClick={() => switchContextHandler()}
        disabled={!currentOrg}
      >
        <div>
          <Avatar size="medium" user={user} />
          {`${user?.firstName} ${user?.lastName}`}
        </div>
        {!currentOrg ? <span className={styles.indicator} /> : <></>}
      </button>

      {sortOrgs(orgs)?.map((org, index) => (
        <>
          <span className={styles.divider} />
          <button
            key={index}
            className={`${styles.item} ${
              org.id === currentOrg?.id ? styles.active : ""
            }`}
            tabIndex={0}
            onClick={() => switchContextHandler(org)}
            disabled={org.id === currentOrg?.id}
          >
            <div>
              <Avatar size="medium" user={user} org={org} />
              {org.name}
            </div>
            {org.id === currentOrg?.id ? (
              <span className={styles.indicator} />
            ) : (
              <></>
            )}
          </button>
        </>
      ))}
    </div>
  );
}
