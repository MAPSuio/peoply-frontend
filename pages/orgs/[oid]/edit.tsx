import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import useSWR from "swr";
import Avatar from "../../../components/Avatar";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import TextInputLong from "../../../components/inputs/TextInputLong";
import MenuModal from "../../../components/MenuModal";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";
import { Organization, SnackTypes } from "../../../types/types";
import styles from "../../../styles/EditProfile.module.scss";
import EditProfileImageMenu from "../../../components/EditProfileImageMenu";

const EditOrgProfile: NextPage = () => {
  const goBack = useBack();
  const [editImage, setEditImage] = useState(false);
  const { user, loading, reload } = useUser();
  const [description, setDescription] = useState("");
  const [validEdit, setValidEdit] = useState(false);
  const redirectToLogin = useRedirectToLogin();
  const router = useRouter();
  const { oid } = router.query;

  const {
    data: org,
    error: orgError,
    mutate,
  } = useSWR<Organization>(
    () => (oid ? `/organizations/${oid}` : false),
    fetchFromPeoplyApiJson,
  );

  const { addSnack } = useSnack();
  useEffect(() => {
    if (org?.description) {
      setDescription(org.description);
    }
  }, [org]);

  useEffect(() => {
    /* we must check if it is the first time the user updates desc */
    if (
      !(!org?.description && description === "") &&
      org?.description !== description
    ) {
      setValidEdit(true);
    } else {
      setValidEdit(false);
    }
  }, [description, org]);

  if (!loading && !user) {
    redirectToLogin();
  }

  if (!org) return <></>;
  if (!user) return <></>;

  const handleEditImageModalClose = () => {
    setEditImage(false);
    mutate();
    reload();
  };

  const updateOrgDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleConfirm = async () => {
    try {
      await fetchFromPeoplyApiJson(`/organizations/${oid}`, {
        method: "PATCH",
        body: JSON.stringify({ description }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      reload();
      addSnack("Profil oppdatert", SnackTypes.SUCCESS);
    } catch (error) {
      addSnack("Klarte ikke å oppdatere profilen", SnackTypes.ERROR);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <button
        className={styles.editImageButton}
        onClick={() => setEditImage(true)}
      >
        <Avatar user={user} org={org} size="large" edit />
      </button>
      <TextInputLong
        value={description}
        handleChange={updateOrgDescription}
        inputName="orgDescription"
        inputId="orgDescription"
        rows={5}
        label="Beskrivelse"
        placeholder=""
        maxLength={120}
        errorMessage=""
        className={styles.description}
      />
      <div className={`${styles.confirm} ${validEdit ? styles.show : ""}`}>
        <Button
          disabled={!validEdit}
          text="Lagre endringer"
          onClick={handleConfirm}
        />
      </div>
      {editImage && (
        <MenuModal label="Endre bilde" onClose={handleEditImageModalClose}>
          <EditProfileImageMenu
            onClose={handleEditImageModalClose}
            endpoint={`/organizations/${oid}`}
            formDataKey="orgImage"
          />
        </MenuModal>
      )}
    </div>
  );
};

export default EditOrgProfile;
