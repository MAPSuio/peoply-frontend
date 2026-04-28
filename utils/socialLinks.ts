import { Organization } from "../types/types";

export const organizationSocialPlatforms = [
  {
    key: "websiteUrl",
    label: "Nettside",
    placeholder: "https://example.no",
  },
  {
    key: "instagramUrl",
    label: "Instagram",
    placeholder: "https://instagram.com/foreningen",
  },
  {
    key: "facebookUrl",
    label: "Facebook",
    placeholder: "https://facebook.com/foreningen",
  },
  {
    key: "tiktokUrl",
    label: "TikTok",
    placeholder: "https://tiktok.com/@foreningen",
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/foreningen",
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    placeholder: "https://youtube.com/@foreningen",
  },
] as const;

export type OrganizationSocialLinkKey =
  typeof organizationSocialPlatforms[number]["key"];

export type OrganizationSocialLinkValues = Record<
  OrganizationSocialLinkKey,
  string
>;

export const emptyOrganizationSocialLinkValues: OrganizationSocialLinkValues = {
  websiteUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
};

export const normalizeOrganizationSocialLinkValue = (
  value?: string | null,
): string | null => {
  const trimmedValue = value?.trim() ?? "";

  return trimmedValue.length > 0 ? trimmedValue : null;
};

export const isValidOrganizationSocialLink = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return true;
  }

  try {
    const url = new URL(normalizedValue);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const getOrganizationSocialLinkFormValues = (
  organization?: Partial<
    Record<OrganizationSocialLinkKey, string | null>
  > | null,
): OrganizationSocialLinkValues => ({
  websiteUrl: organization?.websiteUrl ?? "",
  instagramUrl: organization?.instagramUrl ?? "",
  facebookUrl: organization?.facebookUrl ?? "",
  tiktokUrl: organization?.tiktokUrl ?? "",
  linkedinUrl: organization?.linkedinUrl ?? "",
  youtubeUrl: organization?.youtubeUrl ?? "",
});

export const buildOrganizationSocialLinkPayload = (
  socialLinks: OrganizationSocialLinkValues,
): Record<OrganizationSocialLinkKey, string | null> => ({
  websiteUrl: normalizeOrganizationSocialLinkValue(socialLinks.websiteUrl),
  instagramUrl: normalizeOrganizationSocialLinkValue(socialLinks.instagramUrl),
  facebookUrl: normalizeOrganizationSocialLinkValue(socialLinks.facebookUrl),
  tiktokUrl: normalizeOrganizationSocialLinkValue(socialLinks.tiktokUrl),
  linkedinUrl: normalizeOrganizationSocialLinkValue(socialLinks.linkedinUrl),
  youtubeUrl: normalizeOrganizationSocialLinkValue(socialLinks.youtubeUrl),
});

export const getOrganizationSocialLinks = (organization: Organization) =>
  organizationSocialPlatforms
    .map((platform) => ({
      ...platform,
      url: normalizeOrganizationSocialLinkValue(organization[platform.key]),
    }))
    .filter(
      (
        platform,
      ): platform is typeof organizationSocialPlatforms[number] & {
        url: string;
      } => Boolean(platform.url),
    );
