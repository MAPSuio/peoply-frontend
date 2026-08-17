import { useEffect, useState } from "react";
import useSWR from "swr";

import { ApiError } from "../services/apiError";
import { fetchFromPeoplyApi } from "../services/fetchers";
import { type OrganizationReportStatus, SnackTypes } from "../types/types";
import { formatCountdown } from "../utils/countdown";
import useRedirectToLogin from "./useRedirectToLogin";
import useSnack from "./useSnack";
import useUser from "./useUser";

/** Seconds left of the cooldown, ticking once a second while one is running. */
function useCooldownSeconds(status?: OrganizationReportStatus) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!status?.nextReportAt) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status?.nextReportAt]);

  if (!status?.nextReportAt || status.canReport) return 0;

  return Math.max(
    0,
    Math.ceil((new Date(status.nextReportAt).getTime() - now) / 1000),
  );
}

/**
 * What a failed report means: the cooldown the API sent back when it refused
 * because one is already running, and what to tell the user. Pure, so the
 * rate-limit wording can be tested without a rendered component.
 */
function reportFailure(error: unknown) {
  const cooldown =
    error instanceof ApiError && error.status === 429
      ? (error.body as OrganizationReportStatus)
      : null;

  if (!cooldown) {
    return { cooldown, message: "Kunne ikke rapportere foreningen" };
  }

  const countdown = formatCountdown(cooldown.remainingSeconds ?? 0);

  return {
    cooldown,
    message: countdown
      ? `Du kan rapportere igjen om ${countdown}`
      : "Du kan bare rapportere en gang i timen",
  };
}

/**
 * Reporting an organization, cooldown included: whether the button may fire,
 * how long until it may again, and the snacks for every outcome.
 */
export default function useOrganizationReport(organizationId?: string) {
  const { user } = useUser();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();
  const [reporting, setReporting] = useState(false);

  const { data: status, mutate: mutateStatus } =
    useSWR<OrganizationReportStatus>(
      user && organizationId
        ? `/organizations/${organizationId}/report-status`
        : null,
    );

  const remainingSeconds = useCooldownSeconds(status);
  const countdown = formatCountdown(remainingSeconds);

  const startCooldown = (next: OrganizationReportStatus) =>
    mutateStatus(
      {
        canReport: false,
        nextReportAt: next.nextReportAt,
        remainingSeconds: next.remainingSeconds ?? 0,
      },
      false,
    );

  const report = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    if (reporting || (status && !status.canReport)) {
      if (countdown) {
        addSnack(`Du kan rapportere igjen om ${countdown}`, SnackTypes.ERROR);
      }
      return;
    }

    try {
      setReporting(true);
      const response = await fetchFromPeoplyApi(
        `/organizations/${organizationId}/report`,
        { method: "POST" },
      );
      startCooldown(await response.json());
      addSnack("Foreningen er rapportert", SnackTypes.SUCCESS);
    } catch (error) {
      const { cooldown, message } = reportFailure(error);
      if (cooldown) startCooldown(cooldown);
      addSnack(message, SnackTypes.ERROR);
    } finally {
      setReporting(false);
    }
  };

  return { report, reporting, remainingSeconds };
}
