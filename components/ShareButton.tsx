import useSnack from "../hooks/useSnack";
import { SnackTypes } from "../types/types";
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
  function buttonOnClick(event: MouseEvent) {
    event.preventDefault();
    if (
      navigator.canShare &&
      navigator.canShare({
        url: shareUrl,
        files: shareFiles,
        text: shareText,
        title: shareTitle,
      })
    ) {
      navigator.share({
        url: shareUrl,
        files: shareFiles,
        text: shareText,
        title: shareTitle,
      });
    } else {
      if (shareUrl) {
        navigator.clipboard.writeText(shareUrl);
        addSnack("Lenken ble kopiert!", SnackTypes.SUCCESS);
      } else if (shareFiles) {
        const data = shareFiles.map((file) => {
          const blob = new Blob([file], { type: file.type });
          return new ClipboardItem({
            [blob.type]: blob,
          });
        });
        navigator.clipboard.write(data);
        addSnack("Filen ble kopiert!", SnackTypes.SUCCESS);
      } else if (shareText) {
        navigator.clipboard.writeText(shareText);
        addSnack("Teksten ble kopiert!", SnackTypes.SUCCESS);
      }
    }
  }

  return (
    <Button
      text={buttonText}
      small
      width={width}
      onClick={(e: MouseEvent) => buttonOnClick(e)}
      noShadow
      icon={<ShareIcon />}
      iconPlacement={iconPlacement}
      className={styles.shareButton}
    />
  );
}
