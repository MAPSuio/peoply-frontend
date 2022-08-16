// Next.js.
import Image from "next/image";

// React.
import { useRef, ChangeEvent } from "react";

// Components.
import EditIcon from "../svgs/EditIcon";
import WarningIcon from "../svgs/WarningIcon";
import ErrorIcon from "../svgs/ErrorIcon";

// Assets.
import PlaceholderImage from "../../assets/images/cat.jpg";

// Types.
import { ImageCaching } from "../../types/types";

// Styles.
import styles from "../../styles/ImageInput.module.scss";

interface ImageInputProps {
  inputId: string;
  inputName: string;
  label: string;
  buttonLabel: string;
  value?: File;
  errorMessage: string;
  required?: boolean;
  imageCached: ImageCaching;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ImageInput = ({
  inputId,
  inputName,
  label,
  buttonLabel,
  value,
  errorMessage,
  required,
  onChange,
  imageCached,
}: ImageInputProps) => {
  const imageInput = useRef<HTMLInputElement>(null);

  const getImageInputStyles = () => {
    return fileTooLarge
      ? styles.imageInputContainer
      : `${styles.imageInputContainer} ${styles.noErrorPadding}`;
  };

  const clickImageInput = () => {
    imageInput?.current?.click();
  };

  /* Do not allow images larger than 50MB. */
  const fileMaxSize = 50000000;
  /* Do not allow images larger than 4.5MB for storage */
  const maxCachedSize = 4500000;
  const fileTooLarge = value && value.size > fileMaxSize;
  const fileNotCached = !fileTooLarge && value && value.size > maxCachedSize;
  const oldFileNotCached =
    !fileTooLarge && imageCached === ImageCaching.REFRESH_MESSAGE;

  const imageSource = value
    ? value && URL.createObjectURL(value)
    : PlaceholderImage;
  const imageInputStyles = getImageInputStyles();

  return (
    <div className={imageInputStyles}>
      <p className={styles.label}>{label}</p>
      <div className={styles.imageContainer}>
        <Image
          src={imageSource}
          alt="A very cute cat"
          objectFit="cover"
          layout="fill"
          objectPosition="center"
        />
      </div>
      <input
        className={styles.imageInput}
        type="file"
        id={inputId}
        name={inputName}
        accept="image/*"
        required={required}
        ref={imageInput}
        onChange={onChange}
      />
      <button className={styles.imageInputButton} onClick={clickImageInput}>
        <EditIcon />
        <span className={styles.imageInputButtonLabel}>{buttonLabel}</span>
      </button>
      {fileTooLarge && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
      {fileNotCached && (
        <div className={styles.warningContainer}>
          <WarningIcon className={styles.warningIcon} />
          <p className={styles.warningText}>
            Bildet er for stort til å kunne mellomlagres, og må lastes opp på
            nytt dersom du avslutter og kommer tilbake til
            arrangementopprettelsen
          </p>
        </div>
      )}

      {oldFileNotCached && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>
            Vi kunne dessverre ikke mellomlagre ditt tidligere arrangementsbilde
            grunnet den store størrelsen. Vennligst last opp bildet på nytt.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageInput;
