import { useRef } from "react";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/EditProfileImageMenu.module.scss";
import TrashIcon from "./svgs/TrashIcon";
import UploadIcon from "./svgs/UploadIcon";

interface EditProfileImageMenuProps {
  onClose?: () => void;
  endpoint: string;
  formDataKey: string;
}

/* meant to be used as a child of MenuModal */
const EditProfileImageMenu = ({
  onClose,
  endpoint,
  formDataKey,
}: EditProfileImageMenuProps) => {
  const imageInput: React.RefObject<HTMLInputElement> = useRef(null);

  const handleUploadClick = () => {
    if (imageInput.current) {
      imageInput.current.click();
    }
  };

  const handleImageUpload = async (e: any) => {
    const image: File = e.target.files[0];
    if (image) {
      const formData = new FormData();
      formData.append(formDataKey, image, image.name);
      await fetchFromPeoplyApiJson(endpoint, {
        method: "PATCH",
        body: formData,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const handleImageDelete = async () => {
    await fetchFromPeoplyApiJson(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ removeImage: true }),
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    if (onClose) {
      onClose();
    }
  };
  return (
    <div className={styles.container}>
      <span className={styles.divider} />
      {/* Visually hidden and opened by the button below, so it is taken out of
          the tab order rather than presented as a second, unlabelled control. */}
      <input
        className={styles.imageInput}
        type="file"
        accept="image/*"
        ref={imageInput}
        onChange={handleImageUpload}
        aria-label="Velg profilbilde"
        tabIndex={-1}
      />
      <button
        type="button"
        className={styles.uploadImage}
        onClick={handleUploadClick}
      >
        <UploadIcon />
        Last opp bilde
      </button>
      <span className={styles.divider} />
      <button
        type="button"
        className={styles.removeImage}
        onClick={handleImageDelete}
      >
        <TrashIcon />
        Fjern gjeldende bilde
      </button>
    </div>
  );
};

export default EditProfileImageMenu;
