import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import EditProfileImageMenu from "../../components/EditProfileImageMenu";
import TextInputLong from "../../components/inputs/TextInputLong";
import MenuModal from "../../components/MenuModal";
import PrimaryButton from "../../components/PrimaryButton";
import useBack from "../../hooks/useBack";
import useUser from "../../hooks/useUser";
import { fetchFromPeoplyApi } from "../../services/fetchers";
import styles from "../../styles/EditProfile.module.scss";

const EditProfile: NextPage = () => {
  const goBack = useBack();
  const [editImage, setEditImage] = useState(false);
  const { user, loading, reload } = useUser();
  const [description, setDescription] = useState("");
  const [validEdit, setValidEdit] = useState(false);

  useEffect(() => {
    if (user?.description) {
      setDescription(user.description);
    }
  }, [user]);

  useEffect(() => {
    /* we must check if it is the first time the user updates desc */
    if (
      !(!user?.description && description === "") &&
      user?.description !== description
    ) {
      setValidEdit(true);
    } else {
      setValidEdit(false);
    }
  }, [description, user]);

  const router = useRouter();

  if (!loading && !user) {
    router.push("/login");
  }

  if (!user) return <></>;

  const handleEditImageModalClose = () => {
    setEditImage(false);
    reload();
  };

  const updateUserDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleConfirm = async () => {
    await fetchFromPeoplyApi("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ description }),
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    reload();
  };

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <button
        className={styles.editImageButton}
        onClick={() => setEditImage(true)}
      >
        <Avatar user={user} size="large" edit />
      </button>
      <TextInputLong
        value={description}
        handleChange={updateUserDescription}
        inputName="userDescription"
        inputId="userDescription"
        rows={5}
        label="Beskrivelse"
        placeholder=""
        maxLength={150}
        errorMessage=""
        className={styles.description}
      />
      <div className={`${styles.confirm} ${validEdit ? styles.show : ""}`}>
        <PrimaryButton
          disabled={!validEdit}
          text="Lagre endringer"
          onClick={handleConfirm}
        />
      </div>
      {editImage && (
        <MenuModal label="Endre bilde" onClose={handleEditImageModalClose}>
          <EditProfileImageMenu onClose={handleEditImageModalClose} />
        </MenuModal>
      )}
    </div>
  );
};

export default EditProfile;
