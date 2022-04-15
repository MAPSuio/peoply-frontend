import useSnack from "../hooks/useSnack";
import useUser from "../hooks/useUser";
import { fetchFromPeoplyApi } from "../services/fetchers";
import styles from "../styles/ProfileMenu.module.scss";
import { SnackTypes } from "../types/types";
import ProfileMenuItem from "./ProfileMenuItem";
import CloseIcon from "./svgs/CloseIcon";
import LogoutIcon from "./svgs/LogoutIcon";

/* TODO: WIP */
export default function OrgMenu() {
  const { currentOrg, switchContext, reload } = useUser();
  const { addSnack } = useSnack();

  const handleLogout = async () => {
    switchContext();
    addSnack(`Logget ut av ${currentOrg?.name}`, SnackTypes.ERROR);
  };

  const handleDelete = async () => {
    try {
      const response = await fetchFromPeoplyApi(
        `/organizations/${currentOrg?.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.status === 200) {
        addSnack(`Slettet ${currentOrg?.name}`, SnackTypes.SUCCESS);
        switchContext();
        reload();
      } else {
        addSnack(`Kunne ikke slette ${currentOrg?.name}`, SnackTypes.ERROR);
      }
    } catch (error) {
      addSnack(`Kunne ikke slette ${currentOrg?.name}`, SnackTypes.ERROR);
    }
  };

  return (
    <div className={styles.container}>
      <ProfileMenuItem
        text="Logg ut av organisasjon"
        Icon={LogoutIcon}
        danger
        ActionIcon={CloseIcon}
        linkOrOnClick={handleLogout}
      />
      <ProfileMenuItem
        text="Slett organisasjonen"
        Icon={LogoutIcon}
        danger
        ActionIcon={CloseIcon}
        linkOrOnClick={handleDelete}
      />
    </div>
  );
}
