import { useRouter } from "next/router";
import { useState } from "react";
import useSnack from "../hooks/useSnack";
import useUser from "../hooks/useUser";
import { fetchFromPeoplyApi } from "../services/fetchers";
import styles from "../styles/ProfileMenu.module.scss";
import { Organization, SnackTypes } from "../types/types";
import Modal from "./Modal";
import ProfileMenuItem from "./ProfileMenuItem";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import CloseIcon from "./svgs/CloseIcon";
import EditIcon from "./svgs/EditIcon";
import LogoutIcon from "./svgs/LogoutIcon";
import UsersIcon from "./svgs/UsersIcon";

interface OrgMenuProps {
  org: Organization;
}

/* TODO: WIP */
export default function OrgMenu({ org }: OrgMenuProps) {
  const { addSnack } = useSnack();
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { reload } = useUser();

  const handleDelete = async () => {
    try {
      const response = await fetchFromPeoplyApi(`/organizations/${org.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 200) {
        addSnack(`Slettet ${org.name}`, SnackTypes.WARNING);
        reload(); // refresh orgs in user data
        router.push(`/me/orgs`);
      } else {
        addSnack(`Kunne ikke slette ${org.name}`, SnackTypes.ERROR);
      }
    } catch (error) {
      addSnack(`Kunne ikke slette ${org.name}`, SnackTypes.ERROR);
    }
  };

  return (
    <div className={styles.container}>
      <ProfileMenuItem
        text="Rediger organisasjon"
        Icon={() => <EditIcon className={styles.icon} />}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={`/orgs/${org.id}/edit`}
      />
      <ProfileMenuItem
        text="Behandle medlemmer"
        Icon={() => <UsersIcon className={styles.icon} />}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={`/orgs/${org.id}/members`}
      />
      <span className={styles.divider} />
      <ProfileMenuItem
        text="Slett organisasjonen"
        Icon={LogoutIcon}
        danger
        ActionIcon={CloseIcon}
        linkOrOnClick={() => setModalOpen(true)}
      />
      {modalOpen && (
        <Modal
          label={`Vil du slette ${org.name}?`}
          description="Dette vil slette organisasjonen og all tilknyttet data. Dette kan ikke reverseres."
          buttonText={`Slett ${org.name}`}
          secondaryButtonText="Lukk"
          buttonOnClick={handleDelete}
          danger
          secondaryButtonOnClick={() => setModalOpen(false)}
          closeButtonOnclick={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
