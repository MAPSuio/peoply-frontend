import useSWR, { useSWRConfig } from "swr";

import useFollowArranger from "../../hooks/useFollowArranger";
import useUser from "../../hooks/useUser";
import {
  type ArrangerFollower,
  ButtonSize,
  ButtonType,
  type Organization,
} from "../../types/types";
import Button from "../Button";

export interface OrganizationFollowButtonProps {
  organization: Organization;
}

export default function OrganizationFollowButton({
  organization,
}: OrganizationFollowButtonProps) {
  const { user } = useUser();
  const { mutate } = useSWRConfig();
  const setFollowingArranger = useFollowArranger();

  const {
    data: followedArrangers,
    isLoading,
    mutate: mutateFollowedArrangers,
  } = useSWR<ArrangerFollower[]>(user ? `/users/${user.id}/following` : false);

  const following = followedArrangers?.some(
    (arranger) => arranger.arrangerId === organization.arrangerId,
  );

  const toggleFollowing = async () => {
    const changed = await setFollowingArranger(
      organization.arrangerId,
      !following,
    );

    if (!changed) return;

    mutateFollowedArrangers();
    /* The follower count lives in OrganizationStats, which owns its own SWR
       key; mutating by key is how the two stay in sync without the page
       threading a mutate callback between them. */
    mutate(`/organizations/${organization.id}/followers`);
  };

  return (
    <Button
      text={following ? "Følger" : "Følg"}
      size={ButtonSize.TINYWITHTEXT}
      type={following ? ButtonType.CONFIRMED : ButtonType.PRIMARY}
      noShadow
      onClick={toggleFollowing}
      /* Absence of data is not the same as a request in flight: if /following
         fails, the data never arrives and the button used to spin forever.
         401/403 are suppressed on purpose, so that failure was silent - a
         permanent spinner and no error. Ask SWR whether the request is
         actually running instead. */
      loading={isLoading}
    />
  );
}
