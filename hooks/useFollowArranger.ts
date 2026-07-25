import { fetchFromPeoplyApi } from "../services/fetchers";
import { SnackTypes } from "../types/types";
import useRedirectToLogin from "./useRedirectToLogin";
import useSnack from "./useSnack";
import useUser from "./useUser";

/**
 * Follows or unfollows an arranger.
 *
 * The org page and the followed-arrangers list both need the same three steps -
 * send anonymous users to login, POST/DELETE the change, snack on failure - but
 * they track "am I following this arranger" differently: the org page derives it
 * from /users/:id/following, while the list item keeps it in local state. So the
 * request is shared here and the state stays with the caller.
 *
 * The arranger is passed per call rather than to the hook because the org page
 * only knows its arrangerId after an early return, which is too late to call a
 * hook.
 */
const useFollowArranger = () => {
  const { user } = useUser();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  /**
   * Resolves to true only when the change actually reached the API, so callers
   * holding their own state do not flip it on a failed request.
   */
  const setFollowingArranger = async (
    arrangerId: string,
    following: boolean,
  ): Promise<boolean> => {
    if (!user) {
      redirectToLogin();
      return false;
    }

    try {
      /* The raw fetcher: neither endpoint's body is read, and parsing one we
         ignore is just another way to fail. */
      await fetchFromPeoplyApi(`/users/${user.id}/following/${arrangerId}`, {
        method: following ? "POST" : "DELETE",
      });
      return true;
    } catch {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
      return false;
    }
  };

  return setFollowingArranger;
};

export default useFollowArranger;
