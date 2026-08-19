/* Components. */
import Button from "./Button";
import GoogleLogo from "./svgs/GoogleLogo";
import VippsLogo from "./svgs/VippsLogo";

/* Types. */
import { ButtonSize, ButtonType, LoginProvider } from "../types/types";

/* Constants. */
import { LINK_PATHS, PROVIDER_NAMES } from "../constants/providers";
import { API_URL } from "../constants/urls";

/* Styles. */
import styles from "../styles/ProviderLinkRow.module.scss";

interface ProviderLinkRowProps {
  provider: LoginProvider;
  linked: boolean;
  /** False when this is the account's only login method. */
  canUnlink: boolean;
  onUnlink: () => void;
}

/**
 * One login provider in settings: logo, link status and the action that
 * flips it. Linking navigates through the backend's OIDC link flow (the
 * intent is bound server-side to the session, so it survives the IdP round
 * trip); unlinking is delegated to the confirm modal via onUnlink.
 */
const ProviderLinkRow = ({
  provider,
  linked,
  canUnlink,
  onUnlink,
}: ProviderLinkRowProps) => {
  const startLinking = () => {
    // Bring the user back here once the link flow lands on /login/callback.
    localStorage.setItem("redirectURL", "/me/settings");
    window.location.href = `${API_URL}${LINK_PATHS[provider]}`;
  };

  return (
    <div className={styles.row}>
      <span className={styles.logo} aria-hidden="true">
        {provider === LoginProvider.VIPPS ? <VippsLogo /> : <GoogleLogo />}
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{PROVIDER_NAMES[provider]}</span>
        <span className={styles.status}>
          {linked
            ? canUnlink
              ? "Tilkoblet"
              : "Tilkoblet – din eneste innloggingsmetode"
            : "Ikke tilkoblet"}
        </span>
      </span>
      {linked ? (
        canUnlink && (
          <Button
            text="Koble fra"
            type={ButtonType.SECONDARY}
            size={ButtonSize.SMALL}
            width="fit-content"
            className={styles.action}
            noShadow
            onClick={onUnlink}
          />
        )
      ) : (
        <Button
          text="Koble til"
          type={ButtonType.SECONDARY}
          size={ButtonSize.SMALL}
          width="fit-content"
          className={styles.action}
          noShadow
          onClick={startLinking}
        />
      )}
    </div>
  );
};

export default ProviderLinkRow;
