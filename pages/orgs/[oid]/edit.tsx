import type { NextPage } from "next";
import { useRouter } from "next/router";

import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import EditableAvatar from "../../../components/EditableAvatar";
import RequireUser from "../../../components/RequireUser";
import TextInput from "../../../components/inputs/TextInput";
import TextInputLong from "../../../components/inputs/TextInputLong";
import useBack from "../../../hooks/useBack";
import useOrganizationProfileEdit from "../../../hooks/useOrganizationProfileEdit";
import type { User } from "../../../types/types";

import styles from "../../../styles/EditProfile.module.scss";

const URL_ID_PATTERN = /^[a-z0-9]*$/;

const EditOrganizationForm = ({ user }: { user: User }) => {
  const goBack = useBack();
  const router = useRouter();
  const organizationId = router.query.oid as string | undefined;
  const profile = useOrganizationProfileEdit(organizationId);
  const { org } = profile;

  if (!org) return <></>;

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <EditableAvatar
        user={user}
        org={org}
        endpoint={`/organizations/${organizationId}`}
        formDataKey="orgImage"
        onImageChanged={profile.refresh}
      />
      <TextInputLong
        value={profile.description}
        handleChange={(e) => profile.setDescription(e.target.value)}
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
        value={profile.urlId}
        handleChange={(e) => profile.setUrlId(e.target.value.toLowerCase())}
        inputName="orgUrlId"
        inputId="orgUrlId"
        label="URL identifikator (kun bokstaver og tall)"
        placeholder={org.id}
        maxLength={50}
        minLength={3}
        errorMessage=""
        regExp={URL_ID_PATTERN}
        whiteList={[""]}
        valid={profile.validUrlId}
        setValid={profile.setValidUrlId}
        validate
      />
      <div
        className={`${styles.confirm} ${profile.validEdit ? styles.show : ""}`}
      >
        <Button
          disabled={!profile.validEdit}
          text="Lagre endringer"
          onClick={profile.save}
        />
      </div>
    </div>
  );
};

const EditOrgProfile: NextPage = () => (
  <RequireUser>{(user) => <EditOrganizationForm user={user} />}</RequireUser>
);

export default EditOrgProfile;
