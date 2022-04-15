/* component that accepts a list of orgs as props and renders them */

import { Organization, SnackTypes } from "../types/types";
import styles from "../styles/OrgList.module.scss";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import PlusIcon from "./svgs/PlusIcon";
import router from "next/router";
import useUser from "../hooks/useUser";
import useSnack from "../hooks/useSnack";

interface OrgListProps {
  orgs: Organization[];
}

export default function OrgList({ orgs }: OrgListProps) {
  const { switchContext } = useUser();
  const { addSnack } = useSnack();

  const switchContextHandler = (org: Organization) => {
    switchContext(org);
    addSnack(`Byttet til ${org.name}.`, SnackTypes.SUCCESS);
    router.push("/me");
  };

  return (
    <div className={styles.container}>
      {orgs.map((org, index) => (
        <button
          key={index}
          className={styles.item}
          tabIndex={0}
          onClick={() => switchContextHandler(org)}
        >
          <div>
            <p>{org.name}</p>
          </div>
          <ChevronRightIcon />
        </button>
      ))}

      <button
        className={styles.item}
        tabIndex={0}
        onClick={() => router.push("/orgs/create")}
      >
        <div>
          <p>Opprett ny</p>
        </div>
        <PlusIcon />
      </button>
    </div>
  );
}
