import Image from "next/image";

import { useRef, ChangeEvent } from "react";

import EditIcon from "../svgs/EditIcon";

import PlaceholderImage from "../../assets/images/max.jpg";
import styles from "../../styles/ImageInput.module.scss";
import ErrorIcon from "../svgs/ErrorIcon";

interface ImageInputProps {
  inputId: string;
  inputName: string;
  label: string;
  buttonLabel: string;
  value?: File;
  errorMessage: string;
  required?: boolean;
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
}: ImageInputProps) => {
  const imageInput = useRef(null);

  const getImageInputStyles = () => {
    return fileTooLarge
      ? styles.imageInputContainer
      : `${styles.imageInputContainer} ${styles.noErrorPadding}`;
  };

  const clickImageInput = () => {
    /* TODO: Fix TS error here. */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    imageInput.current.click();
  };

  /* Do not allow images larger than 50MB. */
  const fileMaxSize = 50000000;
  const fileTooLarge = value && value.size > fileMaxSize;

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
          alt="En sykt kjekk kar"
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
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ImageInput;
