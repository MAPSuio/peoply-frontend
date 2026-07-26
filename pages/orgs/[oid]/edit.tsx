import type { NextPage } from "next";
import { useRouter } from "next/router";
import { type ChangeEvent, useEffect, useState } from "react";
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
import { type Organization, SnackTypes } from "../../../types/types";
import styles from "../../../styles/EditProfile.module.scss";
import EditProfileImageMenu from "../../../components/EditProfileImageMenu";
import TextInput from "../../../components/inputs/TextInput";

const EditOrgProfile: NextPage = () => {
  const goBack = useBack();
  const [editImage, setEditImage] = useState(false);
  const { user, loading, reload } = useUser();
  const [description, setDescription] = useState("");
  const [urlId, setUrlId] = useState("");
  const [validUrlId, setValidUrlId] = useState(true); // true by default because we don't want to show an error before the user has typed anything
  const [validEdit, setValidEdit] = useState(false);
  const redirectToLogin = useRedirectToLogin();
  const router = useRouter();
  const { oid } = router.query;

  const { data: org, mutate } = useSWR<Organization>(() =>
    oid ? `/organizations/${oid}` : false,
  );

  const { addSnack } = useSnack();
  useEffect(() => {
    if (org?.description) {
      setDescription(org.description);
    }
    if (org?.urlId) {
      setUrlId(org.urlId);
    }
  }, [org]);

  useEffect(() => {
    const validDescEdit =
      !(!org?.description && description === "") &&
      org?.description !== description;
    const validUrlIdEdit =
      !(!org?.urlId && urlId === "") && org?.urlId !== urlId;
    /* we must check if it is the first time the user updates desc */
    if ((validDescEdit || validUrlIdEdit) && validUrlId) {
      setValidEdit(true);
    } else {
      setValidEdit(false);
    }
  }, [urlId, description, org, validUrlId]);

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

  const updateOrgDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const updateOrgUrlId = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlId(e.target.value.toLowerCase());
  };

  const handleConfirm = async () => {
    try {
      await fetchFromPeoplyApiJson(`/organizations/${org.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          description,
          urlId: urlId === "" && urlId !== org.urlId ? null : urlId,
        }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      mutate();
      reload();
      addSnack("Profil oppdatert", SnackTypes.SUCCESS);
    } catch (error) {
      if (error instanceof Response && error.status === 409) {
        addSnack("URL-id er allerede i bruk", SnackTypes.ERROR);
      } else {
        addSnack("Klarte ikke å oppdatere profilen", SnackTypes.ERROR);
      }
    }
  };

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <button
        type="button"
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
      <TextInput
        value={urlId}
        handleChange={updateOrgUrlId}
        inputName="orgUrlId"
        inputId="orgUrlId"
        label="URL identifikator (kun bokstaver og tall)"
        placeholder={org.id}
        maxLength={50}
        minLength={3}
        errorMessage=""
        // regext checking that string only contains letters and numbers
        regExp={/^[a-z0-9]*$/}
        whiteList={[""]}
        valid={validUrlId}
        setValid={setValidUrlId}
        validate
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
