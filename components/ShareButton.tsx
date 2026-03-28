import { MouseEvent } from "react";

import useSnack from "../hooks/useSnack";
import { ButtonSize, SnackTypes } from "../types/types";
import Button, { IconPlacement } from "./Button";
import ShareIcon from "./svgs/ShareIcon";
import styles from "../styles/ShareButton.module.scss";

interface ShareButtonProps {
  shareUrl?: string;
  shareFiles?: File[];
  shareText?: string;
  shareTitle?: string;
  buttonText: string;
  width?: string;
  iconPlacement?: IconPlacement;
}

export function ShareButton({
  shareUrl,
  shareFiles,
  shareText,
  shareTitle,
  buttonText,
  width,
  iconPlacement = IconPlacement.LEFT,
}: ShareButtonProps) {
  const { addSnack } = useSnack();
  async function buttonOnClick(event: MouseEvent) {
    event.preventDefault();
    try {
      if (
        navigator.canShare &&
        navigator.canShare({
          url: shareUrl,
          files: shareFiles,
          text: shareText,
          title: shareTitle,
        })
      ) {
        await navigator.share({
          url: shareUrl,
          files: shareFiles,
          text: shareText,
          title: shareTitle,
        });
      } else {
        if (shareUrl) {
          await navigator.clipboard.writeText(shareUrl);
          addSnack("Lenken ble kopiert!", SnackTypes.SUCCESS);
        } else if (shareFiles) {
          const data = shareFiles.map((file) => {
            const blob = new Blob([file], { type: file.type });
            return new ClipboardItem({
              [blob.type]: blob,
            });
          });
          await navigator.clipboard.write(data);
          addSnack("Filen ble kopiert!", SnackTypes.SUCCESS);
        } else if (shareText) {
          await navigator.clipboard.writeText(shareText);
          addSnack("Teksten ble kopiert!", SnackTypes.SUCCESS);
        }
      }
    } catch (error) {
      addSnack("Kunne ikke dele akkurat nå", SnackTypes.ERROR);
    }
  }

  return (
    <Button
      text={buttonText}
      size={ButtonSize.SMALL}
      width={width}
      onClick={buttonOnClick}
      noShadow
      icon={<ShareIcon className={styles.icon} />}
      iconPlacement={iconPlacement}
      className={styles.shareButton}
    />
  );
}
