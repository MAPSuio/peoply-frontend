// Next.js.
import Link from "next/link";

// React.
import { useState } from "react";

// Components.
import Button from "./Button";
import Avatar from "./Avatar";

// Hooks.
import useUser from "../hooks/useUser";
import useSnack from "../hooks/useSnack";
import useRedirectToLogin from "../hooks/useRedirectToLogin";

// Services.
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";

// Utils.
import { formatFollowedDate } from "../utils/functions";

// Types.
import {
  ArrangerFollower,
  ButtonSize,
  ButtonType,
  SnackTypes,
} from "../types/types";

// Styles.
import styles from "../styles/ArrangerListItem.module.scss";

interface ArrangerListItemProps {
  arrangerFollower: ArrangerFollower;
}

const ArrangerListItem = ({ arrangerFollower }: ArrangerListItemProps) => {
  const { user } = useUser();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  const [following, setFollowing] = useState(true);

  const arrangerName = (() => {
    const arranger = arrangerFollower.arranger;

    if (arranger.organization) {
      return arranger.organization.name;
    }

    return `${arranger.user?.firstName} ${arranger.user?.lastName}`;
  })();

  const arrangerHref = (() => {
    const arranger = arrangerFollower.arranger;

    if (arranger.organization) {
      return `/orgs/${arranger.organization.id}`;
    }

    return `/users/${arranger.user?.id}`;
  })();

  const renderAvatar = (() => {
    const arranger = arrangerFollower.arranger;

    if (arranger.organization) {
      return <Avatar size="medium" org={arranger.organization} />;
    }

    return <Avatar size="medium" user={arranger.user} />;
  })();

  const dateString = formatFollowedDate(arrangerFollower.createdAt);

  const followArranger = async () => {
    try {
      await fetchFromPeoplyApiJson(
        `/users/${user?.id}/following/${arrangerFollower.arrangerId}`,
        {
          method: "POST",
        },
      );
      setFollowing(true);
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  };

  const unfollowArranger = async () => {
    try {
      await fetchFromPeoplyApi(
        `/users/${user?.id}/following/${arrangerFollower.arrangerId}`,
        {
          method: "DELETE",
        },
      );
      setFollowing(false);
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  };

  const followButtonFunction = () => {
    if (user) {
      following ? unfollowArranger() : followArranger();
    } else {
      redirectToLogin();
    }
  };

  const followButtonText = (() => {
    return following ? "Avfølg" : "Følg";
  })();

  const followButtonType = (() => {
    return following ? ButtonType.DANGERSOFT : ButtonType.PRIMARY;
  })();

  return (
    <li className={styles.listItem}>
      <Link href={arrangerHref} className={styles.container}>
        <div className={styles.info}>
          {renderAvatar}
          <div className={styles.nameContainer}>
            <p className={styles.name}>{arrangerName}</p>
            <p className={styles.description}>
              Fulgt siden <span className={styles.data}>{dateString}</span>
            </p>
          </div>
        </div>
        <Button
          text={followButtonText}
          size={ButtonSize.TINYWITHTEXT}
          type={followButtonType}
          noShadow
          className={styles.button}
          onClick={(e) => {
            e.preventDefault();
            followButtonFunction();
          }}
        />
      </Link>
    </li>
  );
};

export default ArrangerListItem;
