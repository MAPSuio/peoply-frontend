import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import Modal from "../../../components/Modal";
import ModalButton from "../../../components/ModalButton";
import QueryState from "../../../components/QueryState";
import RequireUser from "../../../components/RequireUser";
import PopupContentModal from "../../../components/popups/PopupContentModal";
import PopupSections from "../../../components/popups/PopupSections";
import PlusIcon from "../../../components/svgs/PlusIcon";
import useBack from "../../../hooks/useBack";
import usePopupSchedule from "../../../hooks/usePopupSchedule";
import {
  ButtonSize,
  ButtonType,
  type Popup,
  type User,
} from "../../../types/types";
import { isAdmin } from "../../../utils/admin";

import styles from "../../../styles/PopupScheduler.module.scss";

const PopupSchedule = ({ user }: { user: User }) => {
  const router = useRouter();
  const goBack = useBack();
  const [editorPopup, setEditorPopup] = useState<Popup | "new">();
  const [deletePopup, setDeletePopup] = useState<Popup>();
  const admin = isAdmin(user);
  const schedule = usePopupSchedule(admin);

  useEffect(() => {
    if (!admin) {
      router.replace("/me");
    }
  }, [router, admin]);

  if (!admin) {
    return null;
  }

  const confirmDelete = async () => {
    if (deletePopup && (await schedule.remove(deletePopup.id))) {
      setDeletePopup(undefined);
    }
  };

  return (
    <>
      <HeadComponent
        title="Schedule en pop-up"
        description="Planlegg meldinger som vises i Peoply"
      />
      <main className={styles.container}>
        <BackButton onClick={goBack} />
        <header className={styles.header}>
          <h1>Schedule en pop-up</h1>
          <Button
            text="Ny pop-up"
            icon={<PlusIcon />}
            hideText
            size={ButtonSize.SMALL}
            onClick={() => setEditorPopup("new")}
            className={styles.addButton}
            width="44px"
          />
        </header>

        <QueryState
          query={schedule.query}
          errorMessage="Kunne ikke hente popupene."
        >
          {(popups) => (
            <PopupSections
              popups={popups}
              onEdit={setEditorPopup}
              onChangeDates={schedule.updateDates}
              onDelete={setDeletePopup}
            />
          )}
        </QueryState>
      </main>

      {editorPopup && (
        <PopupContentModal
          popup={editorPopup === "new" ? undefined : editorPopup}
          onClose={() => setEditorPopup(undefined)}
          onSave={(payload) =>
            editorPopup === "new"
              ? schedule.create(payload)
              : schedule.update(editorPopup.id, payload)
          }
        />
      )}
      {deletePopup && (
        <Modal
          label="Slett pop-up?"
          description={`«${deletePopup.title}» fjernes permanent.`}
          closeButtonOnClick={() => setDeletePopup(undefined)}
        >
          <ModalButton
            text="Slett"
            type={ButtonType.DANGER}
            onClick={confirmDelete}
          />
          <ModalButton
            text="Avbryt"
            type={ButtonType.SECONDARY}
            onClick={() => setDeletePopup(undefined)}
          />
        </Modal>
      )}
    </>
  );
};

const PopupScheduler: NextPage = () => (
  <RequireUser>{(user) => <PopupSchedule user={user} />}</RequireUser>
);

export default PopupScheduler;
