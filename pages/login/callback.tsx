import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Modal from "../../components/Modal";
import ModalButton from "../../components/ModalButton";
import {
  isLoginProvider,
  CONFIRM_LINK_PATHS,
  PROVIDER_LOGOS,
  PROVIDER_NAMES,
} from "../../constants/providers";
import { API_URL } from "../../constants/urls";
import { ButtonType, LoginProvider } from "../../types/types";
import { toSafeRedirectPath } from "../../utils/redirect";

/** The providers the existing account can log in with, per `link_with`. */
const parseLinkWith = (linkWith: unknown): LoginProvider[] => {
  const providers =
    typeof linkWith === "string"
      ? linkWith.split(",").filter(isLoginProvider)
      : [];

  // An account without provider rows only exists in dev seeds; offer both
  // rather than a modal with no way forward.
  return providers.length > 0
    ? providers
    : [LoginProvider.VIPPS, LoginProvider.GOOGLE];
};

const LoginCallback: NextPage = () => {
  const router = useRouter();

  const linkPrompt =
    typeof router.query.link_prompt === "string" &&
    isLoginProvider(router.query.link_prompt)
      ? router.query.link_prompt
      : undefined;

  useEffect(() => {
    if (!router.isReady || linkPrompt) {
      // The modal needs the stashed redirectURL to survive the confirm
      // re-auth round trip, so nothing is consumed while it is showing.
      return;
    }

    const redirectURL = localStorage.getItem("redirectURL");
    localStorage.removeItem("redirectURL");
    // Checked again on the way out as well as on the way in: localStorage is
    // writable by anything running in this origin, and router.push turns a
    // value with a scheme into window.location.href = value.
    const target = toSafeRedirectPath(redirectURL);

    // The link outcome rides along to the destination, where it becomes a
    // snack (settings listens for these).
    const outcome = new URLSearchParams();
    if (typeof router.query.linked === "string") {
      outcome.set("linked", router.query.linked);
    }
    if (typeof router.query.link_error === "string") {
      outcome.set("link_error", router.query.link_error);
    }

    const query = outcome.toString();
    router.push(
      query ? `${target}${target.includes("?") ? "&" : "?"}${query}` : target,
    );
  }, [router, linkPrompt]);

  if (!linkPrompt) {
    return <></>;
  }

  const linkWith = parseLinkWith(router.query.link_with);
  const existingNames = linkWith
    .map((provider) => PROVIDER_NAMES[provider])
    .join(" eller ");

  const cancel = () => {
    localStorage.removeItem("redirectURL");
    router.replace("/login");
  };

  return (
    <Modal
      label="Du har allerede en bruker"
      description={`E-postadressen fra ${PROVIDER_NAMES[linkPrompt]} er allerede knyttet til en bruker på Peoply.\nLogg inn med ${existingNames} for å koble kontoene, så kan du bruke begge til å logge inn.`}
      closeButtonOnClick={cancel}
    >
      {linkWith.map((provider) => {
        const Logo = PROVIDER_LOGOS[provider];
        return (
          <ModalButton
            key={provider}
            text={`Logg inn med ${PROVIDER_NAMES[provider]}`}
            icon={<Logo />}
            onClick={() => {
              window.location.href = `${API_URL}${CONFIRM_LINK_PATHS[provider]}`;
            }}
          />
        );
      })}
      <ModalButton text="Avbryt" onClick={cancel} type={ButtonType.SECONDARY} />
    </Modal>
  );
};

export default LoginCallback;
