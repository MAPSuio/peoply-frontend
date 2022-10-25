/* component that accepts a list of orgs as props and renders them */

import { Organization } from "../types/types";
import styles from "../styles/OrgList.module.scss";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import PlusIcon from "./svgs/PlusIcon";
import router from "next/router";
import Link from "next/link";

interface OrgListProps {
  orgs: Organization[];
}

export default function OrgList({ orgs }: OrgListProps) {
  return (
    <div className={styles.container}>
      {orgs.map((org, index) => (
        <Link href={`/orgs/${org.urlId ?? org.id}`} key={index} passHref>
          <a className={styles.item}>
            <div>
              <p>{org.name}</p>
            </div>
            <ChevronRightIcon />
          </a>
        </Link>
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
