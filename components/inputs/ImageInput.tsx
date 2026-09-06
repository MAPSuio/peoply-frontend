// Next.js.
import Image from "next/legacy/image";

// React.
import { type ChangeEvent, useEffect, useRef, useState } from "react";

// Components.
import WarningIcon from "../svgs/WarningIcon";
import ErrorIcon from "../svgs/ErrorIcon";
import ImageCropper from "./ImageCropper";

// Assets.
import PlaceholderImage from "../../assets/images/cat.jpg";

// Types.
import { ImageCaching } from "../../types/types";

// Utils.
import cx from "../../utils/cx";

// Styles.
import styles from "../../styles/ImageInput.module.scss";

/* A sanity bound on decoding, not on uploading: the cropper re-encodes to a
   JPEG under the backend's 5MB cap, so the file the user picks no longer has to
   respect it. Beyond ~25MB decoding stalls low-end phones for seconds. */
const maxSourceSize = 25000000;

/* Above this the cropped result is too large for the localStorage draft. */
const maxCachedSize = 4500000;

interface ImageInputProps {
  inputId: string;
  inputName: string;
  label: string;
  buttonLabel: string;
  /** The cropped image currently held by the form. */
  value?: File;
  placeholder?: string;
  errorMessage: string;
  required?: boolean;
  imageCached?: ImageCaching;
  /** Receives the cropped JPEG produced by the cropper. */
  onImageChange: (file: File) => void;
  /** True while a crop is being encoded, so callers can gate their submit. */
  onProcessingChange?: (processing: boolean) => void;
  noExtraInfo?: boolean;
  card?: boolean;
}

const ImageInput = ({
  inputId,
  inputName,
  label,
  buttonLabel,
  value,
  placeholder,
  errorMessage,
  required,
  onImageChange,
  onProcessingChange,
  imageCached,
  noExtraInfo,
  card,
}: ImageInputProps) => {
  const imageInput = useRef<HTMLInputElement>(null);

  /* The original picked file, kept apart from `value`: the form holds the
     cropped output, while the cropper needs the full-resolution source to keep
     re-cropping from. */
  const [sourceFile, setSourceFile] = useState<File | undefined>(value);
  const [cropError, setCropError] = useState<string>();

  /* The last file handed upward. Without it, our own output arriving back as
     `value` would be adopted as a new source and re-cropped forever. */
  const emittedFile = useRef<File | undefined>(undefined);

  const onProcessingChangeRef = useRef(onProcessingChange);
  onProcessingChangeRef.current = onProcessingChange;

  /* `value` changing to something we did not emit means it came from elsewhere:
     a restored draft, or "Slett bilde" clearing it. */
  useEffect(() => {
    if (value === emittedFile.current) {
      return;
    }
    setSourceFile(value);
    setCropError(undefined);
  }, [value]);

  const clickImageInput = () => {
    imageInput?.current?.click();
  };

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];

    /* Reset the input so picking the same file twice still fires a change -
       useful after a decode error. */
    e.target.value = "";

    if (!picked) {
      return;
    }

    setCropError(undefined);
    setSourceFile(picked);
  };

  const handleCropped = (cropped: File) => {
    emittedFile.current = cropped;
    onImageChange(cropped);
  };

  const fileTooLarge = Boolean(sourceFile && sourceFile.size > maxSourceSize);
  const fileNotCached =
    !fileTooLarge && Boolean(value && value.size > maxCachedSize);
  const oldFileNotCached =
    !fileTooLarge && imageCached === ImageCaching.REFRESH_MESSAGE;
  const showCropper = Boolean(sourceFile) && !fileTooLarge;

  /* A source that cannot be cropped leaves nothing in flight, so make sure a
     previously reported "processing" state does not stick. */
  useEffect(() => {
    if (!showCropper) {
      onProcessingChangeRef.current?.(false);
    }
  }, [showCropper]);

  const imageSource = placeholder ?? PlaceholderImage;

  return (
    <div
      className={cx(
        styles.imageInputContainer,
        !fileTooLarge && styles.noErrorPadding,
        !fileTooLarge && styles.labelValid,
      )}
    >
      {required ? (
        <label className={cx(styles.label, styles.required)} htmlFor={inputId}>
          {label}
          {!noExtraInfo && <span className={styles.asterisk}> *</span>}
        </label>
      ) : (
        <label className={styles.label} htmlFor={inputId}>
          {`${label} ${!noExtraInfo ? "(frivillig)" : ""}`}
        </label>
      )}
      {showCropper && sourceFile ? (
        <ImageCropper
          file={sourceFile}
          onCropped={handleCropped}
          onProcessingChange={onProcessingChange}
          onError={setCropError}
        />
      ) : (
        <div className={styles.imageContainer}>
          <Image
            src={imageSource}
            alt={
              placeholder
                ? "Nåværende arrangementsbilde"
                : "Eksempel på et arrangementsbilde"
            }
            objectFit="cover"
            layout="fill"
            objectPosition="center"
          />
        </div>
      )}
      <input
        className={styles.imageInput}
        type="file"
        id={inputId}
        name={inputName}
        accept="image/*"
        required={required}
        ref={imageInput}
        onChange={handleFilePick}
      />
      <button
        type="button"
        className={cx(styles.imageInputButton, card && styles.card)}
        onClick={clickImageInput}
      >
        <span className={styles.imageInputButtonLabel}>{buttonLabel}</span>
      </button>
      {fileTooLarge && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
      {cropError && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{cropError}</p>
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
